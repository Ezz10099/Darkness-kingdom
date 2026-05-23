const SaveManager = {
  KEY: 'darkness_kingdom_save',
  LEGACY_KEY: 'arcane_academy_save',

  save(state) {
    try { localStorage.setItem(this.KEY, JSON.stringify(state)); } catch (e) { console.error('Save failed', e); }
  },

  load() {
    try {
      const currentSave = localStorage.getItem(this.KEY);
      if (currentSave) return JSON.parse(currentSave);

      const legacySave = localStorage.getItem(this.LEGACY_KEY);
      if (!legacySave) return null;

      const parsedLegacySave = JSON.parse(legacySave);
      this.save(parsedLegacySave);
      return parsedLegacySave;
    } catch (e) {
      return null;
    }
  },

  deleteSave() {
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.LEGACY_KEY);
  }
};

export default SaveManager;
