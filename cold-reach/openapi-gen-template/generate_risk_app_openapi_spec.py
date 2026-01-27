#!/usr/bin/env python3
"""
Extract ColdReach paths and schemas from OpenAPI spec.

This script reads the main api-core.yaml file and creates a new OpenAPI spec
containing only paths tagged with 'ColdReach' and their associated schemas.
"""

import yaml
import json
from pathlib import Path
from typing import Dict, Any, Set
import re


def extract_schema_references(obj: Any, refs: Set[str]) -> None:
    """Recursively extract all schema references from an object."""
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key == '$ref' and isinstance(value, str):
                # Extract schema name from reference like '#/components/schemas/SchemaName'
                if value.startswith('#/components/schemas/'):
                    schema_name = value.split('/')[-1]
                    refs.add(schema_name)
            else:
                extract_schema_references(value, refs)
    elif isinstance(obj, list):
        for item in obj:
            extract_schema_references(item, refs)


def get_dependent_schemas(schema_name: str, all_schemas: Dict[str, Any], visited: Set[str]) -> Set[str]:
    """Get all schemas that this schema depends on (recursive)."""
    if schema_name in visited or schema_name not in all_schemas:
        return set()
    
    visited.add(schema_name)
    dependent_refs = set()
    
    # Extract references from this schema
    extract_schema_references(all_schemas[schema_name], dependent_refs)
    
    # Recursively get dependencies of dependencies
    all_deps = dependent_refs.copy()
    for dep in dependent_refs:
        all_deps.update(get_dependent_schemas(dep, all_schemas, visited.copy()))
    
    return all_deps


def main():
    # Path to the input OpenAPI spec
    input_file = Path("openapi-gen-template/api-core.yaml")
    output_file = Path("openapi-gen-template/cold-reach-app.yaml")

    if not input_file.exists():
        print(f"Error: Input file {input_file} not found")
        return 1
    
    print(f"Loading OpenAPI spec from {input_file}")
    
    # Load the OpenAPI spec
    with open(input_file, 'r', encoding='utf-8') as f:
        spec = yaml.safe_load(f)
    
    # Create new spec with basic structure
    cold_reach_spec = {
        'openapi': spec.get('openapi', '3.1.0'),
        'info': {
            'description': 'API for Cold Reach',
            'title': 'Cold Reach AI Services',
            'version': spec.get('info', {}).get('version', '1.0.0')
        },
        'servers': spec.get('servers', []),
        'paths': {},
        'components': {
            'schemas': {}
        }
    }
    
    # Extract paths tagged with 'ColdReach'
    cold_reach_paths = {}
    all_schema_refs = set()
    
    if 'paths' in spec:
        for path, path_obj in spec['paths'].items():
            for method, method_obj in path_obj.items():
                print(f"Processing path: {path} [{method}]")
                if path == "/" or (
                   isinstance(method_obj, dict) and 'tags' in method_obj and 'ColdReach' in method_obj['tags'] 
                ):
                    path = f"/cold-reach/api/v1{path}"
                    if path not in cold_reach_paths:
                        cold_reach_paths[path] = {}
                    cold_reach_paths[path][method] = method_obj
                          
                    # Extract schema references from this path
                    extract_schema_references(method_obj, all_schema_refs)
    
    print(f"Found {len(cold_reach_paths)} paths with ColdReach tag")
    print(f"Found {len(all_schema_refs)} direct schema references")
    
    # Get all schemas from the original spec
    all_schemas = spec.get('components', {}).get('schemas', {})
    
    # Get all dependent schemas (recursive dependencies)
    all_required_schemas = set(all_schema_refs)
    for schema_ref in all_schema_refs.copy():
        deps = get_dependent_schemas(schema_ref, all_schemas, set())
        all_required_schemas.update(deps)
    
    print(f"Total required schemas (including dependencies): {len(all_required_schemas)}")
    
    # Extract required schemas
    for schema_name in all_required_schemas:
        if schema_name in all_schemas:
            cold_reach_spec['components']['schemas'][schema_name] = all_schemas[schema_name]
        else:
            print(f"Warning: Schema '{schema_name}' not found in original spec")
    
    # Add the filtered paths
    cold_reach_spec['paths'] = cold_reach_paths

    # Remove request parameters
    for path, path_obj in cold_reach_spec.get('paths', {}).items():
        for method, method_obj in path_obj.items():
            if isinstance(method_obj, dict) and 'parameters' in method_obj:
                method_obj['parameters'] = [
                    param for param in method_obj['parameters'] 
                    if param.get('name') != 'request'
                ]
    
    # Write the new spec
    print(f"Writing Cold Reach spec to {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        yaml.dump(cold_reach_spec, f, default_flow_style=False, sort_keys=False, indent=2, width=float('inf'))
    
    # Print summary
    print("\n" + "="*60)
    print("EXTRACTION SUMMARY")
    print("="*60)
    print(f"Input file: {input_file}")
    print(f"Output file: {output_file}")
    print(f"Extracted paths: {len(cold_reach_paths)}")
    print(f"Extracted schemas: {len(cold_reach_spec['components']['schemas'])}")
    
    print("\nExtracted paths:")
    for path, methods in cold_reach_paths.items():
        method_list = ', '.join(methods.keys())
        print(f"  {path} ({method_list})")
    
    print(f"\nExtracted schemas:")
    schema_names = sorted(cold_reach_spec['components']['schemas'].keys())
    for i, schema in enumerate(schema_names, 1):
        print(f"  {i:2d}. {schema}")
    
    return 0


if __name__ == "__main__":
    exit(main())