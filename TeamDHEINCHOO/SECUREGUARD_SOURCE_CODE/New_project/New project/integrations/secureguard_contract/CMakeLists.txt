cmake_minimum_required(VERSION 3.10)
project(counter)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Path to WADK SDK
set(WADK_DIR "$ENV{HOME}/wadk-0.1.3")

set(LIBWEIL_DIR "${WADK_DIR}/adk/cpp/weilsdk/build/lib")

include_directories("${WADK_DIR}/adk/cpp/weilsdk/include")

add_executable(counter src/main.cpp)

target_link_libraries(counter "${LIBWEIL_DIR}/libweilsdk_static.a")

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s STANDALONE_WASM --no-entry -O3 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s INITIAL_MEMORY=16777216 -s ALLOW_MEMORY_GROWTH=1")
