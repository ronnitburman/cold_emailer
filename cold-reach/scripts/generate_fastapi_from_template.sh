#!/bin/sh -xe

script_dir=$(cd "$(dirname "$0")" && pwd)
export GENERATOR_VERSION="v7.3.0"
export GENERATOR_POST_PROCESS_SCRIPT="scripts/run-post-process-pyfile-wrapper.sh"
export INPUT_YAML_FILE="openapi-gen-template/api-core.yaml"
export OUTPUT_FOLDER="api-core"

# Re-init log dir to store runtime logs
log_dir="$script_dir/log"
mkdir -p "$log_dir"
rm -rf "${log_dir:?}"/*

# Remove the model files so that if any files are deleted, they show up
# in git status
echo "${OUTPUT_FOLDER}/src/openapi_server/models"
pwd
echo "${script_dir}"
rm -rf "../${OUTPUT_FOLDER}/src/openapi_server/models"

docker run --rm -v "${script_dir}/..:/local" \
  -e "PYTHON_POST_PROCESS_FILE=./local/${GENERATOR_POST_PROCESS_SCRIPT}" \
  openapitools/openapi-generator-cli:${GENERATOR_VERSION} generate --enable-post-process-file \
  -i /local/${INPUT_YAML_FILE} -g python-fastapi -o /local/${OUTPUT_FOLDER}

# Check if black is installed in the venv
if ! (cd "${script_dir}/../api-core" && uv run python -m black --version) >/dev/null 2>&1; then
  echo "Error: black is not installed. Please run 'make install-reqs' first."
  exit 1
fi

# Run black (allow non-zero exit when it reformats files)
(cd "${script_dir}/../api-core" && uv run python -m black .) || true
