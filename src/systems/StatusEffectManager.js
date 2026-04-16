import { STATUS_EFFECT } from '../data/constants.js';

class StatusEffectInstance {
  constructor({ type, targetId, duration, magnitude, sourceHeroId }) {
    this.type = type;
    this.targetId = targetId;
    this.duration = duration;
    this.magnitude = magnitude;
    this.sourceHeroId = sourceHeroId;
  }
}

const StatusEffectManager = {
  _effects: new Map(),

  apply(instance) {
    if (!this._effects.has(instance.targetId)) this._effects.set(instance.targetId, []);
    const existing = this._effects.get(instance.targetId);
    const idx = existing.findIndex(e => e.type === instance.type && e.sourceHeroId === instance.sourceHeroId);
    if (idx >= 0) existing[idx] = instance; else existing.push(instance);
  },

  tick() {
    for (const [targetId, effects] of this._effects.entries()) {
      for (const e of effects) e.duration--;
      this._effects.set(targetId, effects.filter(e => e.duration > 0));
      if (this._effects.get(targetId).length === 0) this._effects.delete(targetId);
    }
  },

  getActiveEffects(targetId) { return this._effects.get(targetId) || []; },
  hasEffect(targetId, type)  { return this.getActiveEffects(targetId).some(e => e.type === type); },
  clearTarget(targetId)      { this._effects.delete(targetId); },
  clear()                    { this._effects.clear(); },

  toJSON() {
    const obj = {};
    for (const [k, v] of this._effects.entries()) obj[k] = v.map(e => ({ ...e }));
    return obj;
  },

  fromJSON(data) {
    this._effects.clear();
    for (const [k, v] of Object.entries(data || {})) {
      this._effects.set(k, v.map(e => new StatusEffectInstance(e)));
    }
  }
};

export { StatusEffectInstance };
export default StatusEffectManager;
