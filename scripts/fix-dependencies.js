const fs = require("fs")
const path = require("path")

// Function to check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory()
  } catch (err) {
    return false
  }
}

// Function to remove a directory recursively
function removeDirectory(dirPath) {
  if (!directoryExists(dirPath)) return

  console.log(`Removing problematic dependency: ${dirPath}`)

  try {
    if (process.platform === "win32") {
      // On Windows, use a command to remove directory
      require("child_process").execSync(`rmdir /s /q "${dirPath}"`)
    } else {
      // On Unix-like systems
      require("child_process").execSync(`rm -rf "${dirPath}"`)
    }
    console.log(`Successfully removed: ${dirPath}`)
  } catch (error) {
    console.error(`Error removing directory ${dirPath}:`, error.message)
  }
}

// Main function
function main() {
  console.log("Running post-install dependency fix script...")

  // Path to node_modules
  const nodeModulesPath = path.join(process.cwd(), "node_modules")

  // Check if node_modules exists
  if (!directoryExists(nodeModulesPath)) {
    console.log("node_modules directory not found. Nothing to fix.")
    return
  }

  // List of problematic dependencies to remove
  const problematicDeps = ["vaul"]

  // Remove each problematic dependency
  problematicDeps.forEach((dep) => {
    const depPath = path.join(nodeModulesPath, dep)
    removeDirectory(depPath)
  })

  console.log("Post-install dependency fix completed.")
}

// Run the main function
main()
