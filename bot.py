import pyautogui
import time

# Path to the file
FILE_PATH_1 = "/home/mykhailo/smart-city-events-map/app/page.tsx"
DURATION_HOURS = 3  # Stop after 3 hours
INTERVAL = 15       # Interval between writes in seconds
DELETE_DELAY = 5    # Seconds to keep the code before removing it

def write_path_manually(file_path):
    """Simulate typing file path using pyautogui with key codes."""
    for char in file_path:
        if char == '/':
            pyautogui.press('divide')  # Simulating the '/' key
        else:
            pyautogui.write(char)  # Write all other characters normally

def open_file_in_vscode(file_path):
    """Open a file in VS Code from terminal."""
    pyautogui.hotkey('ctrl', 'alt', 't')  # Open terminal (Linux)
    time.sleep(3)

    pyautogui.write('code ')  # Write 'code' to open VS Code in terminal
    time.sleep(1)

    write_path_manually(file_path)  # Write the file path
    pyautogui.press('enter')  # Press Enter to run the command
    time.sleep(3)  # Wait for VS Code to open the file

def type_in_vscode():
    """Simulate typing code into VS Code."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    code_to_add = f"// BOT START\nconsole.log('Bot message at {timestamp}');\n// BOT END\n"
    
    pyautogui.write(code_to_add, interval=0.1)  # Simulate typing with a small delay
    pyautogui.press('enter')  # Simulate pressing Enter after typing the code

    print(f"Bot: Typed code at {timestamp}")

def write_and_remove_code():
    """Write and remove code from the file every few seconds."""
    open_file_in_vscode(FILE_PATH_1)  # Open the file in VS Code

    start_time = time.time()
    end_time = start_time + DURATION_HOURS * 3600  # Run for 3 hours

    while time.time() < end_time:
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        print(f"Bot: Start writing code at {timestamp}")
        
        time.sleep(7)  # Simulate wait time before typing

        # Type code in VS Code
        type_in_vscode()

        # Write the same code to the file directly
        code_to_write = f"// BOT START\nconsole.log('Bot message at {timestamp}');\n// BOT END\n"
        
        with open(FILE_PATH_1, "a") as f1:
            f1.write(code_to_write)

        print(f"Bot: Wrote code to file at {timestamp}")

        # Wait for a while before removing the code
        time.sleep(DELETE_DELAY)

        # Now remove the code (lines between markers)
        print(f"Bot: Removing code from file at {timestamp}")

        # Process the file and remove lines between markers
        with open(FILE_PATH_1, "r") as f1:
            lines = f1.readlines()
        
        new_lines = []
        skip = False
        for line in lines:
            if line.strip() == "// BOT START":
                skip = True  # Start skipping lines after the marker
            if not skip:
                new_lines.append(line)  # Add lines not between the markers
            if line.strip() == "// BOT END":
                skip = False  # Stop skipping after the marker

        with open(FILE_PATH_1, "w") as f1:
            f1.writelines(new_lines)

        print(f"Bot: Removed bot code from file at {timestamp}")

        # Wait until the next iteration
        time.sleep(INTERVAL - DELETE_DELAY)

    print("Bot: 3 hours reached. Bot stopped.")

if __name__ == "__main__":
    write_and_remove_code()
