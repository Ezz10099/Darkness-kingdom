import ElderTreeManager from './ElderTreeManager.js';

const TASK_POOL = [
  { id: 'WIN_ARENA',      label: 'Win 2 Arena battles',             target: 2, scene: 'Arena'                 },
  { id: 'ATTACK_BOSS',    label: 'Attack the World Boss once',       target: 1, scene: 'WorldBoss'             },
  { id: 'CLIMB_AFFINITY', label: 'Climb 5 Affinity Tower floors',    target: 5, scene: 'AffinityTowerSelection' },
  { id: 'CLIMB_ENDLESS',  label: 'Climb 3 Endless Tower floors',     target: 3, scene: 'EndlessTower'           },
  { id: 'SUMMON_HERO',    label: 'Summon 1 hero',                    target: 1, scene: 'Summon'                },
  { id: 'ARENA_FIGHTS',   label: 'Complete 3 Arena fights',          target: 3, scene: 'Arena'                 },
  { id: 'BOSS_TWICE',     label: 'Attack World Boss 2 times',        target: 2, scene: 'WorldBoss'             },
  { id: 'VISIT_CODEX',    label: 'Open the Daily Codex',             target: 1, scene: 'DailyCodex'            },
];

const WEEKLY_TASK_DEF = {
  id:     'WEEKLY_FLOOR_50',
  label:  'Reach Floor 50 on any Affinity Tower',
  target: 50,
  scene:  'AffinityTowerSelection',
};

const DAILY_CHEST  = { gold: 500, crystals: 50, shards: 3 };
const WEEKLY_CHEST = { premiumCrystals: 200 };

function _todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function _weekStr() {
  const d   = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(new Date(d).setDate(diff));
  return mon.toISOString().slice(0, 10);
}

function _shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function _makeDailyTasks() {
  return _shuffle(TASK_POOL).slice(0, 6).map(t => ({
    taskId: t.id, label: t.label, target: t.target, scene: t.scene,
    progress: 0, completed: false,
  }));
}

function _makeWeeklyTask() {
  return {
    taskId: WEEKLY_TASK_DEF.id, label: WEEKLY_TASK_DEF.label,
    target: WEEKLY_TASK_DEF.target, scene: WEEKLY_TASK_DEF.scene,
    progress: 0, completed: false,
  };
}

const DailyCodexManager = {
  dailyTasks:         [],
  dailyChestClaimed:  false,
  lastDailyReset:     null,
  weeklyTask:         null,
  weeklyChestClaimed: false,
  lastWeeklyReset:    null,

  _checkDailyReset() {
    const today = _todayStr();
    if (this.lastDailyReset !== today) {
      this.dailyTasks        = _makeDailyTasks();
      this.dailyChestClaimed = false;
      this.lastDailyReset    = today;
    }
  },

  _checkWeeklyReset() {
    const week = _weekStr();
    if (this.lastWeeklyReset !== week) {
      this.weeklyTask         = _makeWeeklyTask();
      this.weeklyChestClaimed = false;
      this.lastWeeklyReset    = week;
    }
  },

  getTasks() {
    this._checkDailyReset();
    this._checkWeeklyReset();
    return this.dailyTasks;
  },

  getWeeklyTask() {
    this._checkWeeklyReset();
    return this.weeklyTask;
  },

  isAllDailyComplete() {
    return this.dailyTasks.length > 0 && this.dailyTasks.every(t => t.completed);
  },

  getDailyChestReward() {
    const bonus = ElderTreeManager.getCodexQualityBonus();
    if (!bonus) return { ...DAILY_CHEST };
    return {
      gold:     Math.floor(DAILY_CHEST.gold     * (1 + bonus)),
      crystals: Math.floor(DAILY_CHEST.crystals * (1 + bonus)),
      shards:   Math.floor(DAILY_CHEST.shards   * (1 + bonus)),
    };
  },
  getWeeklyChestReward() { return { ...WEEKLY_CHEST }; },

  // Increment progress for a task type. Idempotent on already-completed tasks.
  increment(taskId, amount = 1) {
    this._checkDailyReset();
    for (const t of this.dailyTasks) {
      if (t.taskId === taskId && !t.completed) {
        t.progress = Math.min(t.target, t.progress + amount);
        if (t.progress >= t.target) t.completed = true;
      }
    }
  },

  // Call after any Affinity Tower floor clear to advance weekly goal.
  updateWeeklyFloor(highestFloorOnAnyTower) {
    this._checkWeeklyReset();
    const wt = this.weeklyTask;
    if (!wt || wt.completed) return;
    if (highestFloorOnAnyTower > wt.progress) {
      wt.progress = Math.min(wt.target, highestFloorOnAnyTower);
      if (wt.progress >= wt.target) wt.completed = true;
    }
  },

  claimDailyChest() {
    this._checkDailyReset();
    if (!this.isAllDailyComplete() || this.dailyChestClaimed) return null;
    this.dailyChestClaimed = true;
    return { ...DAILY_CHEST };
  },

  claimWeeklyChest() {
    this._checkWeeklyReset();
    if (!this.weeklyTask?.completed || this.weeklyChestClaimed) return null;
    this.weeklyChestClaimed = true;
    return { ...WEEKLY_CHEST };
  },

  // Milliseconds remaining until next midnight (daily reset)
  msUntilDailyReset() {
    const now = Date.now();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now;
  },

  toJSON() {
    this._checkDailyReset();
    this._checkWeeklyReset();
    return {
      dailyTasks:         this.dailyTasks,
      dailyChestClaimed:  this.dailyChestClaimed,
      lastDailyReset:     this.lastDailyReset,
      weeklyTask:         this.weeklyTask,
      weeklyChestClaimed: this.weeklyChestClaimed,
      lastWeeklyReset:    this.lastWeeklyReset,
    };
  },

  fromJSON(data) {
    if (!data) return;
    this.lastDailyReset    = data.lastDailyReset    || null;
    this.lastWeeklyReset   = data.lastWeeklyReset   || null;
    // Restore task state, then check for resets (new day/week wipes stale data)
    this.dailyTasks        = data.dailyTasks        || [];
    this.dailyChestClaimed = data.dailyChestClaimed || false;
    this.weeklyTask        = data.weeklyTask        || null;
    this.weeklyChestClaimed = data.weeklyChestClaimed || false;
    this._checkDailyReset();
    this._checkWeeklyReset();
  },
};

export default DailyCodexManager;
