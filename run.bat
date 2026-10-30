@echo off
cd /d "C:\Users\vhmar\Marle' van Heerden\digital-styling"
if not exist "size_guide.html" (
    echo ERROR: size_guide.html was not found in this folder!
    pause
    exit
)
echo Opening Women's Standard Clothing Size Guide...
start size_guide.html