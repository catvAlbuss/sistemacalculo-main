// mixins/io/file-io.js — BARRIL de file-io (import/export .e2k, JSON, print,
// modelo, y análisis legacy). Partido por responsabilidad en ./file-io/*.js
// (2026-07-17). cad_sys.js sigue importando este único fileIOMixin.
import { modelFileMixin } from "./file-io/model-file.js";
import { e2kImportMixin } from "./file-io/e2k-import.js";
import { e2kExportMixin } from "./file-io/e2k-export.js";
import { printMixin } from "./file-io/print.js";
import { jsonIoMixin } from "./file-io/json-io.js";
import { legacyAnalysisMixin } from "./file-io/legacy-analysis.js";

export const fileIOMixin = {
  ...modelFileMixin,
  ...e2kImportMixin,
  ...e2kExportMixin,
  ...printMixin,
  ...jsonIoMixin,
  ...legacyAnalysisMixin,
};
