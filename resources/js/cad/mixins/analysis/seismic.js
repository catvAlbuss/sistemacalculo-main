// mixins/analysis/seismic.js — BARRIL del análisis sísmico.
// El código se partió por responsabilidad en ./seismic/*.js (2026-07-17).
// cad_sys.js sigue importando este único seismicMixin.
import { seismicCoreMixin } from "./seismic/core.js";
import { seismicSpectrumMixin } from "./seismic/spectrum.js";
import { seismicPayloadMixin } from "./seismic/payload.js";
import { seismicResultsMixin } from "./seismic/results.js";
import { seismicAnimationMixin } from "./seismic/animation.js";

export const seismicMixin = {
  ...seismicCoreMixin,
  ...seismicSpectrumMixin,
  ...seismicPayloadMixin,
  ...seismicResultsMixin,
  ...seismicAnimationMixin,
};
