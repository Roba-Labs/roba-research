rem This script requires that the Emscripten SDK has been set up in the directory above this one.
rem Follow the instructions here: https://emscripten.org/docs/getting_started/downloads.html

call python ..\..\core\python\mjxmacro_parser.py
rmdir /s /q ..\build
call ..\emsdk\emsdk activate latest
mkdir ..\build
cd ..\build
call emcmake cmake ..\cmake
call emmake make
cd ..\distribution\runtime\wasm
pause
