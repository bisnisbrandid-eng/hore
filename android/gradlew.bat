@echo off
:: Gradle startup script for Windows

set DIR=%~dp0
set APP_HOME=%DIR%
set CLASSPATH=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar

set JAVA_EXE=java.exe
if defined JAVA_HOME set JAVA_EXE=%JAVA_HOME%\bin\java.exe

"%JAVA_EXE%" -cp "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
