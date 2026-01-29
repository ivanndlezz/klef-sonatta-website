// Kit Manager for SVG Symbol Kits
// Handles persistence, import/export

class KitManager {
  constructor(storageKey = "svg-kits") {
    this.storageKey = storageKey;
    this.kits = this.loadKits();
  }

  // Load all kits from localStorage
  loadKits() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Failed to load kits:", e);
      return {};
    }
  }

  // Save kits to localStorage
  saveKits() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.kits));
    } catch (e) {
      console.error("Failed to save kits:", e);
    }
  }

  // Get a kit by name
  getKit(name) {
    return this.kits[name] || [];
  }

  // Save a kit
  saveKit(name, symbols) {
    this.kits[name] = symbols;
    this.saveKits();
  }

  // Delete a kit
  deleteKit(name) {
    delete this.kits[name];
    this.saveKits();
  }

  // List kit names
  listKits() {
    return Object.keys(this.kits);
  }

  // Export kit as JSON string
  exportKit(name) {
    const kit = this.getKit(name);
    return JSON.stringify(kit, null, 2);
  }

  // Import kit from JSON string
  importKit(name, jsonString) {
    try {
      const symbols = JSON.parse(jsonString);
      this.saveKit(name, symbols);
      return true;
    } catch (e) {
      console.error("Failed to import kit:", e);
      return false;
    }
  }

  // Download kit as file
  downloadKit(name) {
    const json = this.exportKit(name);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Load kit from file input
  loadKitFromFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target.result;
      callback(json);
    };
    reader.readAsText(file);
  }

  // Load kit from URL (for external JSON files)
  async loadKitFromURL(name, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const symbols = await response.json();
      this.saveKit(name, symbols);
      return true;
    } catch (e) {
      console.error(`Failed to load kit from ${url}:`, e);
      return false;
    }
  }

  // Load multiple kits from URLs
  async loadKitsFromURLs(kitsConfig) {
    const promises = Object.entries(kitsConfig).map(([name, url]) =>
      this.loadKitFromURL(name, url)
    );
    const results = await Promise.all(promises);
    return results.every((result) => result);
  }
}

// Export for use
window.KitManager = KitManager;
