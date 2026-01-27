#!/bin/bash -xe

# This is a post processing file called by the openapi-specs generator. It takes
# care of some bugs in the generator code. Specifically, the return stmts of the
# generated code does not await on the impl methods. As a result they end up
# having to be a sync method. There are two fixes by this script:
#   1. In all */apis/*_api.py files:
#      1a. for all Header() params, adds an include_in_schema=False
#      1b. for all Body(), remove None as its default, so that it
#          becomes a required element and gets validated with schema
#      1c. for all description text, look for |include_in_schema=False|
#          and if found, add this flag
#      1d. for all request param in cookie, replace it with "request: Request"
#          and add import for the Request module
#      1e. for all background_tasks param in cookie, replace it with "background_tasks: BackgroundTasks"
#          and add import for the BackgroundTasks module
#      1f. for all current_user_id param in cookie, replace it with "current_user_id: str = Depends(get_user_id),"
#          and add import for "from openapi_server.utils.middleware import get_user_id"
#      1g. for all file response objects, replace it with FileResponse
#          and add import for FileResponse from the fastapi module
#      1h. for all attributes called file_upload, change its type to FileUpload
#          and add import for UploadFile from the fastapi module
#      1i. for all Annotated[Optional[StrictBool], replace it with Annotated[Optional[bool]
#          and add import for UploadFile from the fastapi module
#   2. In all */apis/*base_api.py files:
#      2a. for all request param in cookie, replace it with "request: Request"
#          and add import for the Request module
#      2b. for all background_tasks param in cookie, replace it with "background_tasks: BackgroundTasks"
#          and add import for the BackgroundTasks module
#      2c. for all file response objects, replace it with FileResponse
#          and add import for FileResponse from the fastapi module
#

log() {
  msg="$1"
  echo "$msg"
}

process_upload_files() {
  filename="$1"
  log "  Replace 'upload_files:' with 'upload_files: List[UploadFile],' and add 'import UploadFile'"

  # Replace/add the Form import if FileResponse object is returned in the file
  # openapi generator adds 200: {"model": file, "description": "Successful Response"}
  # to the API responses definition, but file type model is not defined (since we're
  # returning FileResponse instead. This should instead be replaced by:
  # 200: {"description": "Successful Response"} (the model attribute is removed)
  #
  data="$(cat "$filename")"
  regex="\s+upload_files:\s+"
  if [[ " $data " =~ $regex ]] ; then
    echo "$data" | sed -e 's/# coding: utf-8/# coding: utf-8\n\nfrom fastapi import UploadFile  # noqa: F401/g' \
	    -re 's/upload_files: List\[file\]*/upload_files: List\[UploadFile\]/g' \
	           > "$filename"
  fi

  return
}

process_upload_file() {
  filename="$1"
  log "  Replace 'upload_file:' with 'upload_file: UploadFile,' and add 'import UploadFile'"

  # Replace/add the Form import if FileResponse object is returned in the file
  # openapi generator adds 200: {"model": file, "description": "Successful Response"}
  # to the API responses definition, but file type model is not defined (since we're
  # returning FileResponse instead. This should instead be replaced by:
  # 200: {"description": "Successful Response"} (the model attribute is removed)
  #
  data="$(cat "$filename")"
  regex="\s+upload_file:\s+"
  if [[ " $data " =~ $regex ]] ; then
    echo "$data" | sed -e 's/# coding: utf-8/# coding: utf-8\n\nfrom fastapi import UploadFile  # noqa: F401/g' \
	    -re 's/upload_file: file*/upload_file: UploadFile,/g' \
	           > "$filename"
  fi

  return
}

process_file_response() {
  filename="$1"
  log "  Replace '-> file:' with '-> FileResponse' and add 'import FileResponse'"

  # Replace/add the Form import if FileResponse object is returned in the file
  # openapi generator adds 200: {"model": file, "description": "Successful Response"}
  # to the API responses definition, but file type model is not defined (since we're
  # returning FileResponse instead. This should instead be replaced by:
  # 200: {"description": "Successful Response"} (the model attribute is removed)
  #
  data="$(cat "$filename")"
  regex="\s+) -> file:\s+"
  if [[ " $data " =~ $regex ]] ; then
    echo "$data" | sed -e 's/# coding: utf-8/# coding: utf-8\n\nfrom fastapi.responses import FileResponse  # noqa: F401/g' \
	               -re 's/\) -> file:/\) -> FileResponse:/g' \
	               -re 's/"model": file, //g' \
	           > "$filename"
  fi

  return
}

process_async_on_base_api_routes() {
  filename="$1"
  echo "Process: $filename (add async before function definitions)"
  data="$(cat "$filename")"
  echo "$data" | sed -e 's/def /async def /g' \
	             -e 's/async def __init_subclass__/def __init_subclass__/g' > "$filename"
  return
}

process_await_on_async_api_routes() {
  filename="$1"
  echo "Process: $filename (add await in return stmts, hide Header() params, make Body() required)"
  data="$(cat "$filename")"
  echo "$data" | sed -e 's/return Base/return await Base/g' \
                     -re 's/Header[(](.*)[)]/Header(\1, include_in_schema=False)/g' \
                     -re 's/Body[(]None, (.*)[)]/Body(\1)/g' \
		     -re 's/description=["]([^"]*) +!include_in_schema.False! *(.*)["]/description="\1\2", include_in_schema=False/g' \
		     -re 's/request(.*)description=["]FastAPI request object["](.*)/request: Request,/g' \
		     > "$filename"

  # Replace/add the Request import if request object is used in the file
  data="$(cat "$filename")"
  regex="\s+request: Request,\s+"
  if [[ " $data " =~ $regex ]] ; then
    echo "$data" | sed -e 's/    Response,/    Request,\n    Response,/g' > "$filename"
  fi

  return
}

process_request_param() {
  filename="$1"

  log "  Replace/add the Request import if request object is used in the file"

  # Replace/add the Request import if request object is used in the file
  data="$(cat "$filename")"
  regex="\s+request: str,\s+"
  if [[ " $data " =~ $regex ]] ; then
    # the stmt below works for inline replacement but only for *_api.py
    #echo "$data" | sed -e 's/    Response,/    Request,\n    Response,/g' > "$filename"

    # the stmt below works for both *_api.py and *_base_api.py by adding a new
    # import statement
    echo "$data" | sed -e 's/# coding: utf-8/# coding: utf-8\n\nfrom fastapi import Request  # noqa: F401/g' \
		       > "$filename"
  fi
  
  data="$(cat "$filename")"
  echo "$data" | sed -re 's/request(.*)description=["]FastAPI request object["](.*)/request: Request,/g' \
	             -re 's/request: str,/request: Request,/g' \
		     > "$filename"

  return
}

process_background_tasks_param() {
  filename="$1"

  log "  Replace/add the BackgroundTasks import if request object is used in the file"
  data="$(cat "$filename")"
  echo "$data" | sed -re 's/background_tasks(.*)description=["]FastAPI background_tasks object["](.*)/background_tasks: BackgroundTasks,/g' \
	             -re 's/background_tasks: str,/background_tasks: BackgroundTasks,/g' \
		     > "$filename"

  # Replace/add the BackgroundTasks import if background_tasks object is used in the file
  data="$(cat "$filename")"
  regex="\s+background_tasks: BackgroundTasks,\s+"
  if [[ " $data " =~ $regex ]] ; then
    # the stmt below works for inline replacement but only for *_api.py
    #echo "$data" | sed -e 's/    Response,/    Request,\n    Response,/g' > "$filename"

    # the stmt below works for both *_api.py and *_base_api.py by adding a new
    # import statement
    echo "$data" | sed -e 's/# coding: utf-8/# coding: utf-8\n\nfrom fastapi import BackgroundTasks  # noqa: F401/g' \
		       > "$filename"
  fi

  return
}

process_current_user_id_param() {
  filename="$1"

  log "  Add the 'import get_userid' middleware if current_user_id is used in the file"
  data="$(cat "$filename")"
  echo "$data" | sed -re 's/current_user_id(.*)description=["]The name of the cookie is configured via an environment variable.["](.*)/current_user_id: str = Depends(get_user_id),/g' \
		     > "$filename"

  # Add the "import get_userid" middleware if current_user_id is used in the file
  data="$(cat "$filename")"
  regex="\s+current_user_id: str = Depends\(get_user_id\),\s+"
  if [[ " $data " =~ $regex ]] ; then
    echo "$data" | sed -e 's/import openapi_server.impl/from openapi_server.utils.middleware import get_user_id\nimport openapi_server.impl/g' > "$filename"
  fi


  return
}

process_api_py() {
  filename="$1"
  log "Process: $filename"
  log "  Hide Header() params, make Body() required, honor description custom directives"
  data="$(cat "$filename")"
  echo "$data" | sed -re 's/Header[(](.*)[)]/Header(\1, include_in_schema=False)/g' \
                     -re 's/Body[(]None, (.*)[)]/Body(\1)/g' \
		     -re 's/description=["]([^"]*) +!include_in_schema.False! *(.*)["]/description="\1\2", include_in_schema=False/g' \
		     -re 's/Annotated[[]Optional[[]StrictBool[]]/Annotated[Optional[bool]/g' \
		     > "$filename"

  process_await_on_async_api_routes "$filename"
  process_request_param "$filename"
  process_background_tasks_param "$filename"
  process_upload_file "$filename"
  process_upload_files "$filename"
  process_file_response "$filename"
  process_current_user_id_param "$filename"

  return
}

process_api_base_py() {
  filename="$1"
  log "Process: $filename"

  process_async_on_base_api_routes "$filename"
  process_request_param "$filename"
  process_background_tasks_param "$filename"
  process_upload_file "$filename"
  process_upload_files "$filename"
  process_file_response "$filename"

  return
}

process_file() {
  filename="$1"
  if [ ! -e "$filename" ] ; then
    return
  fi
  if [[ "$filename" == */apis/*_api.py ]] ; then
    process_api_py "$filename"
  elif [[ "$filename" == */apis/*_api_base.py ]] ; then
    process_api_base_py "$filename"
  elif [[ "$filename" == *_api.py ]] ; then
    process_api_py "$filename"
  fi
}

main() {
  process_file "$1" "$2"
}

main "${@+$1}"
