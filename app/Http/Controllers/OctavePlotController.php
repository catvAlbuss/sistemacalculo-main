<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

ini_set('max_execution_time', 300);
ini_set('memory_limit', '512M');

class OctavePlotController extends Controller
{
    private function runOctave($fun, &$stdout, &$stderr)
    {
        $DESCRIPTORSPEC = array(
            0 => array("pipe", "r"), // stdin is a pipe that the child will read from
            1 => array("pipe", "wb"), // stdout is a pipe that the child will write to
            2 => array("pipe", "w")  // stderr is a file to write to
        );


        if (PHP_OS_FAMILY === "Windows") {
            // === WINDOWS (desarrollo local) ===
            $octaveCandidates = array_values(array_unique(array_filter(array_merge([
                env('OCTAVE_WINDOWS_CLI_PATH'),
                env('OCTAVE_CLI_PATH'),
                "C:\\laragon\\www\\octave\\mingw64\\bin\\octave-cli.exe",
                "C:\\laragon\\www\\octave\\bin\\octave-cli.exe",
                "C:\\laragon\\www\\octave\\bin\\octave-cli",
                "C:\\Program Files\\GNU Octave\\Octave-9.2.0\\mingw64\\bin\\octave-cli.exe",
            ], glob("C:\\Program Files\\GNU Octave\\*\\mingw64\\bin\\octave-cli.exe") ?: []))));
            
            // 🔧 Ruta ABSOLUTA a la carpeta matlab
            $matlabPath = env('OCTAVE_MATLAB_PATH', public_path('assets/matlab'));
            
            // 🔧 Comando con ruta absoluta
            $octavePath = null;
            $checkedOctavePaths = [];
            foreach ($octaveCandidates as $candidate) {
                $checkedOctavePaths[] = $candidate;

                if (!file_exists($candidate)) {
                    continue;
                }

                $signature = file_get_contents($candidate, false, null, 0, 4);
                if ($signature === "\x7FELF") {
                    continue;
                }

                $octavePath = $candidate;
                break;
            }

            if (!$octavePath) {
                $stderr = "No se encontro un octave-cli.exe valido para Windows. Rutas probadas: " . implode(", ", $checkedOctavePaths) . ". La carpeta C:\\laragon\\www\\octave corresponde al paquete Linux del servidor; en local Windows configura OCTAVE_WINDOWS_CLI_PATH con un octave-cli.exe de Windows.";
                return -1;
            }

            if (!is_dir($matlabPath)) {
                $stderr = "No se encontro la carpeta de funciones MATLAB/Octave en: {$matlabPath}";
                return -1;
            }

            $command = "\"$octavePath\" --path \"$matlabPath\" --no-gui --no-history --norc --no-window-system --quiet --eval \"$fun\"";
            $process = proc_open($command, $DESCRIPTORSPEC, $pipes);
        } else {

            // Version de octave
            $OCTAVE_VERSION = "8.0.0";

            // Ruta de octave
            $SNAP =  "/home/u112634954/domains/ryaie.com/octave";

            // Ruta de los matlab
            $MATLABS = "./assets/matlab";

            // Variables de entorno
            $ENV = array(
                "LANGUAGE" => "en_US",
                "LANG" => "en_US.UTF-8",
                "LC_ALL" => "en_US.UTF-8",
                "SNAP" => $SNAP,
                "FONTCONFIG_PATH" => "$SNAP/etc/fonts",
                "FONTCONFIG_FILE" => "$SNAP/etc/fonts/fonts.conf",
                "XDG_DATA_HOME" => "$SNAP/usr/share",
                //"PATH" => "$SNAP/usr/sbin:$SNAP/usr/bin:$SNAP/sbin:$SNAP/bin:\$PATH",
                "GNUPLOT_DRIVER_DIR" => "$SNAP/usr/lib/gnuplot",
                "GNUPLOT_LUA_DIR" => "$SNAP/usr/share/gnuplot/gnuplot/5.2/lua",
                "GNUPLOT_PS_DIR" => "$SNAP/usr/share/gnuplot/gnuplot/5.2/PostScript",
                "GS_LIB" => "$SNAP/usr/share/ghostscript/9.26/Resource/Init:$SNAP/usr/share/ghostscript/9.26/lib:$SNAP/usr/share/ghostscript/9.26/Resource/Font:$SNAP/usr/share/ghostscript/fonts:$SNAP/usr/share/fonts",
                "LOCPATH" => "$SNAP/usr/lib/locale",
                "OCTAVE_HOME" => "$SNAP",
                "PKG_CONFIG_PATH" => "$SNAP/lib/pkgconfig:$SNAP/usr/lib/x86_64-linux-gnu/pkgconfig:$SNAP/usr/share/pkgconfig",
                "PKG_CONFIG_SYSROOT_DIR" => "$SNAP",
                "UNITSFILE" => "$SNAP/usr/share/units/definitions.units",
                "LD_LIBRARY_PATH" => "$SNAP/lib/octave:$SNAP/lib/octave/$OCTAVE_VERSION:$SNAP/usr/lib/x86_64-linux-gnu:$SNAP/usr/lib:$SNAP/lib/x86_64-linux-gnu:$SNAP/bin"
            );

            $command = "PATH=$SNAP/usr/sbin:$SNAP/usr/bin:$SNAP/sbin:$SNAP/bin:\$PATH octave-cli --path $MATLABS --no-gui --no-history --norc --no-window-system --quiet --eval \"$fun\"";
            $process = proc_open($command, $DESCRIPTORSPEC, $pipes, null, $ENV);
        }
        // $command = 'octave-cli --path ' . $MATLABS . ' --no-gui --no-history --norc --no-window-system --quiet --eval "' . $fun . '"';
        // if (PHP_OS_FAMILY !== "Windows" && empty(glob("/usr/bin/octave*"))) {
        //     $command = "PATH=$SNAP/usr/sbin:$SNAP/usr/bin:$SNAP/sbin:$SNAP/bin:\$PATH " . $command;
        //     $process = proc_open($command, $DESCRIPTORSPEC, $pipes, null, $ENV);
        // } else {
        //     $process = proc_open($command, $DESCRIPTORSPEC, $pipes);
        // }
        if (is_resource($process)) {
            // $pipes now looks like this:
            // 0 => writeable handle connected to child stdin
            // 1 => readable handle connected to child stdout

            $stdout = stream_get_contents($pipes[1]);
            $stderr = stream_get_contents($pipes[2], 1024);

            fclose($pipes[0]);
            fclose($pipes[1]);
            fclose($pipes[2]);

            // It is important that you close any pipes before calling
            // proc_close in order to avoid a deadlock
            return proc_close($process);
        } else {
            return -1;
        }
    }

    private function returnOctaveResult($function)
    {
        $isOk = Self::runOctave($function, $stdout, $stderr) === 0;

        if ($isOk) {
            ob_end_clean();
            header('Content-Type: application/octet-stream');
            header('Content-Length: ' . strlen($stdout));
            echo $stdout;
        } else {
            echo $stderr . "<br>" . $function;
        }
    }

    public function graficarFC(Request $request)
    {
        $function = sprintf(
            "fuerzas_cortantes(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);",
            $request->input('fc'),
            $request->input('Fy'),
            /* $request->input('E'), */
            $request->input('b'),
            $request->input('h'),
            $request->input('Lt'),
            $request->input('WD'),
            $request->input('WV'),
            $request->input('anchoTributario'),
            $request->input('frm'),
            $request->input('frv')
        );

        self::returnOctaveResult($function);
    }

    public function graficarAligerados(Request $request)
    {
        $function = sprintf(
            "aligerados(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);",
            $request->input('fc'),
            $request->input('Fy'),
            /* $request->input('E'), */
            $request->input('b'),
            $request->input('h'),
            $request->input('Lt'),
            $request->input('WD'),
            $request->input('WV'),
            $request->input('anchoTributario'),
            $request->input('frm'),
            $request->input('frv')
        );

        self::returnOctaveResult($function);
    }

    public function graficarZapatas(Request $request)
    {
        $function = sprintf(
            "zapatas(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);",
            $request->input("A"),
            $request->input("Ixx"),
            $request->input("Iyy"),
            $request->input("Df"),
            $request->input("PS"),
            $request->input("MXS"),
            $request->input("MYS"),
            $request->input("Pm"),
            $request->input("MXm"),
            $request->input("MYm"),
            $request->input("Pv"),
            $request->input("MXv"),
            $request->input("MYv"),
            $request->input("poligonos"),
        );

        self::returnOctaveResult($function);
    }

    public function graficarZapatas2(Request $request)
    {
        if (PHP_OS_FAMILY === "Windows") {
            return response()->json([
                'resultados' => $this->calcularZapatas2EnPhp($request),
            ]);
        }

        $function = sprintf(
            "zapatas2(%s, %s, %s, %s, %s, '%s', %s, %s);",
            $request->input("poligonos"),
            $request->input("column"),
            $request->input("PD"),
            $request->input("PL"),
            $request->input("SISMO"),
            $request->input("Co"),
            $request->input("dF"),
            $request->input("pesoEspecifico"),
        );

        self::returnOctaveResult($function);
    }

    private function calcularZapatas2EnPhp(Request $request): array
    {
        $poligonos = $this->parseOctaveStruct($request->input('poligonos'));
        $columnas = $this->parseOctaveMatrix($request->input('column'));
        $pd = $this->indexRowsByFirstColumn($this->parseOctaveMatrix($request->input('PD')));
        $pl = $this->indexRowsByFirstColumn($this->parseOctaveMatrix($request->input('PL')));
        $sismo = $this->indexRowsByFirstColumn($this->parseOctaveMatrix($request->input('SISMO')));
        $coExpressions = $this->parseOctaveMatrix($request->input('Co'), false);
        $df = (float) $request->input('dF');
        $pesoEspecifico = (float) $request->input('pesoEspecifico');
        $resultados = [];

        // AGREGADO (ver conversación, "zapatas recortadas"): $poligonos ya
        // no es una lista plana -- viene como {nombre => vertices}. Se
        // agrupan las entradas 'poligonoN' (contorno exterior de CADA
        // zapata, una o varias en el mismo request) con sus
        // 'poligonoN_huecoM' (huecos de esa MISMA zapata) antes de entrar
        // al cálculo. Una zapata sin ningún hueco simplemente no tiene
        // entradas '_hueco' que agrupar -- comportamiento idéntico a antes.
        $grupos = [];
        foreach ($poligonos as $nombre => $vertices) {
            if (preg_match('/^poligono(\d+)$/', $nombre, $m)) {
                $grupos[$m[1]]['exterior'] = $vertices;
            } elseif (preg_match('/^poligono(\d+)_hueco/', $nombre, $m)) {
                $grupos[$m[1]]['huecos'][] = $vertices;
            }
        }

        foreach ($grupos as $poligonoIndex => $grupo) {
            if (!isset($grupo['exterior'])) {
                continue;
            }
            $vertices = $grupo['exterior'];
            $huecos = $grupo['huecos'] ?? [];
            $props = $this->polygonProperties($vertices, $huecos);

            $idsDentro = [];
            $posiciones = [];
            foreach ($columnas as $row) {
                if (count($row) >= 3 && $this->pointInPolygon((float) $row[1], (float) $row[2], $vertices)) {
                    $id = (string) $row[0];
                    $idsDentro[] = $id;
                    $posiciones[$id] = [(float) $row[1], (float) $row[2]];
                }
            }

            $fuerzas = [
                'pm' => 0.0, 'mxm' => 0.0, 'mym' => 0.0,
                'pv' => 0.0, 'mxv' => 0.0, 'myv' => 0.0,
                'ps' => 0.0, 'mxs' => 0.0, 'mys' => 0.0,
            ];

            foreach ($idsDentro as $id) {
                // EXCENTRICIDAD COLUMNA-CENTROIDE: ver mismo comentario en
                // zapatas2.m. $ex/$ey dan 0 si la columna ya cae en el
                // centroide -- no cambia ningún resultado ya validado con
                // zapatas centradas, solo corrige el caso descentrado
                // (antes silenciosamente ignorado).
                [$xi, $yi] = $posiciones[$id];
                $ex = $xi - $props['XC'];
                $ey = $yi - $props['YC'];

                if (isset($pd[$id])) {
                    $p = (float) ($pd[$id][1] ?? 0);
                    $fuerzas['pm'] += $p;
                    $fuerzas['mxm'] += (float) ($pd[$id][2] ?? 0) + $p * $ex;
                    $fuerzas['mym'] += (float) ($pd[$id][3] ?? 0) + $p * $ey;
                }
                if (isset($pl[$id])) {
                    $p = (float) ($pl[$id][1] ?? 0);
                    $fuerzas['pv'] += $p;
                    $fuerzas['mxv'] += (float) ($pl[$id][2] ?? 0) + $p * $ex;
                    $fuerzas['myv'] += (float) ($pl[$id][3] ?? 0) + $p * $ey;
                }
                if (isset($sismo[$id])) {
                    $p = (float) ($sismo[$id][1] ?? 0);
                    $fuerzas['ps'] += $p;
                    $fuerzas['mxs'] += (float) ($sismo[$id][2] ?? 0) + $p * $ex;
                    $fuerzas['mys'] += (float) ($sismo[$id][3] ?? 0) + $p * $ey;
                }
            }

            $centrar = fn ($point) => [$point[0] - $props['XC'], $point[1] - $props['YC']];
            $centered = array_map($centrar, $vertices);
            $centeredHuecos = array_map(fn ($hueco) => array_map($centrar, $hueco), $huecos);
            $centeredProps = $this->polygonProperties($centered, $centeredHuecos);
            $grid = $this->polygonGrid($centered, $centeredHuecos);
            $co = array_map(fn ($row) => array_map(fn ($expr) => $this->evaluateExpression($expr, $fuerzas), $row), $coExpressions);

            // AGREGADO (ver conversación: investigación del cliente sobre
            // zapatas triangulares) — fórmula general de flexocompresión
            // biaxial CON acoplamiento (producto de inercia Ixy), en vez de
            // la versión simplificada de antes (zz = P/A + x*m2/IY + y*m3/IX)
            // que asume, sin comprobarlo, que los ejes X/Y del dibujo son
            // los ejes principales de inercia del polígono. Cuando IXY=0
            // (cualquier rectángulo/cuadrado alineado con los ejes — TODAS
            // las zapatas ya probadas y validadas hasta ahora) esta fórmula
            // se reduce matemáticamente a la de antes, dando exactamente el
            // mismo resultado — no cambia nada de lo ya validado. Solo
            // cuando IXY≠0 (triángulos, trapecios no simétricos, formas
            // rotadas) el término de acoplamiento entra en juego y corrige
            // la presión, que antes podía salir hasta ~80% desviada.
            $ix = $centeredProps['IX'];
            $iy = $centeredProps['IY'];
            $ixy = $centeredProps['IXY'] ?? 0.0;
            $denom = $ix * $iy - $ixy ** 2;

            $zz = array_fill(0, count($co), []);
            foreach ($grid as $point) {
                [$x, $y] = $point;
                foreach ($co as $comboIndex => $combo) {
                    $p = ($combo[0] ?? 0) + $pesoEspecifico * $centeredProps['A'] * $df;
                    $m2 = $combo[1] ?? 0;
                    $m3 = $combo[2] ?? 0;

                    if ($denom != 0.0) {
                        $coefX = ($m2 * $ix - $m3 * $ixy) / $denom;
                        $coefY = ($m3 * $iy - $m2 * $ixy) / $denom;
                    } else {
                        // Degenerado (polígono sin área/inercia real) — cae
                        // de vuelta a la fórmula simple para no dividir
                        // entre cero, mismo comportamiento defensivo que ya
                        // tenía el código antes de este cambio.
                        $coefX = $iy != 0.0 ? $m2 / $iy : 0.0;
                        $coefY = $ix != 0.0 ? $m3 / $ix : 0.0;
                    }

                    $zz[$comboIndex][] = $p / $centeredProps['A'] + $coefX * $x + $coefY * $y;
                }
            }

            $resultados["poligono{$poligonoIndex}"] = [
                'XX' => array_map(fn ($point) => $point[0] + $props['XC'], $grid),
                'YY' => array_map(fn ($point) => $point[1] + $props['YC'], $grid),
                'ZZ' => $zz,
                'min' => array_map(fn ($values) => min($values), $zz),
                'max' => array_map(fn ($values) => max($values), $zz),
                'XC' => [$props['XC']],
                'YC' => [$props['YC']],
            ];
        }

        return $resultados;
    }

    // ACTUALIZADO (ver conversación, "zapatas recortadas"): antes devolvía
    // una lista PLANA de matrices (perdía el nombre 'poligonoN' de cada
    // entrada) -- ahora devuelve un array asociativo {nombre => matriz},
    // preservando el orden de aparición (el mismo que ya usa PHP para
    // arrays). Necesario para poder distinguir 'poligonoN' (contorno
    // exterior de una zapata) de 'poligonoN_huecoM' (un hueco DENTRO de
    // esa zapata) en calcularZapatas2EnPhp() -- antes ambos se hubieran
    // tratado como zapatas separadas.
    private function parseOctaveStruct(?string $value): array
    {
        preg_match_all("/'([^']+)'\\s*,\\s*\\[([^\\]]+)\\]/", $value ?? '', $matches, PREG_SET_ORDER);
        $result = [];
        foreach ($matches as $match) {
            $result[$match[1]] = $this->parseOctaveMatrix("[{$match[2]}]");
        }
        return $result;
    }

    private function parseOctaveMatrix(?string $value, bool $numeric = true): array
    {
        $clean = trim($value ?? '');
        $clean = trim($clean, "[] \t\n\r\0\x0B");
        if ($clean === '') {
            return [];
        }

        return array_map(function ($row) use ($numeric) {
            $cells = array_map('trim', explode(',', $row));
            return $numeric ? array_map('floatval', $cells) : $cells;
        }, array_filter(array_map('trim', explode(';', $clean)), fn ($row) => $row !== ''));
    }

    private function indexRowsByFirstColumn(array $rows): array
    {
        $indexed = [];
        foreach ($rows as $row) {
            if (isset($row[0])) {
                $indexed[(string) $row[0]] = $row;
            }
        }
        return $indexed;
    }

    private function evaluateExpression(string $expression, array $variables): float
    {
        $expr = strtolower($expression);
        foreach ($variables as $name => $value) {
            $expr = preg_replace('/\b' . preg_quote($name, '/') . '\b/', '(' . $value . ')', $expr);
        }
        if (!preg_match('/^[0-9eE+\\-*\\/().\\s]+$/', $expr)) {
            return 0.0;
        }
        return (float) eval("return {$expr};");
    }

    // AGREGADO (ver conversación, "fusionar cimentacion-v1/v2 -- zapatas
    // recortadas"): acumuladores CRUDOS de la fórmula shoelace (área*2,
    // momentos de primer orden, momentos de segundo orden) para UN solo
    // contorno cerrado -- extraído de polygonProperties() para poder
    // reusarlo tanto en el contorno exterior como en cada hueco interior,
    // y restar sus contribuciones de forma consistente (ver
    // polygonProperties() más abajo).
    private function polygonRawTotals(array $points): array
    {
        $a0 = $xc = $yc = $ix0 = $iy0 = $ixy0 = 0.0;
        for ($i = 0; $i < count($points) - 1; $i++) {
            [$x1, $y1] = $points[$i];
            [$x2, $y2] = $points[$i + 1];
            $cross = $x1 * $y2 - $x2 * $y1;
            $a0 += $cross;
            $xc += $cross * ($x2 + $x1);
            $yc += $cross * ($y2 + $y1);
            $iy0 += $cross * ($x2 ** 2 + $x2 * $x1 + $x1 ** 2);
            $ix0 += $cross * ($y2 ** 2 + $y2 * $y1 + $y1 ** 2);
            // AGREGADO (ver conversación: investigación del cliente sobre
            // zapatas triangulares con el método rígido) — producto de
            // inercia Ixy, misma fórmula shoelace que IX/IY de arriba pero
            // con el término cruzado x*y. Antes NO se calculaba: la fórmula
            // de presión de abajo (zz = P/A + Mx*y/Ix + My*x/Iy) solo es
            // válida si los ejes X/Y del dibujo son los EJES PRINCIPALES de
            // inercia del polígono (Ixy=0) — cierto automáticamente para
            // cualquier rectángulo/cuadrado alineado con los ejes (por eso
            // nunca se notó: todas las zapatas probadas hasta ahora eran
            // así), pero FALSO en general para un triángulo o un trapecio
            // no simétrico — ahí, sin este término, la presión calculada
            // puede salir hasta ~80% desviada del valor real (verificado
            // con un triángulo rectángulo simple). Ver el nuevo uso de este
            // valor en calcularZapatas2EnPhp() más abajo.
            $ixy0 += $cross * ($x1 * $y2 + 2 * $x1 * $y1 + 2 * $x2 * $y2 + $x2 * $y1);
        }

        // Normalizado a "sentido antihorario" aquí mismo (a0>0): así, sin
        // importar en qué sentido el usuario dibujó ESTE contorno (exterior
        // o hueco), sus acumuladores siempre representan una contribución
        // POSITIVA de área -- necesario para poder RESTAR huecos con el
        // signo correcto en polygonProperties(), sin depender de que el
        // usuario haya dibujado el hueco en un sentido en particular.
        if ($a0 < 0.0) {
            $a0 *= -1;
            $xc *= -1;
            $yc *= -1;
            $ix0 *= -1;
            $iy0 *= -1;
            $ixy0 *= -1;
        }

        return [$a0, $xc, $yc, $ix0, $iy0, $ixy0];
    }

    /**
     * AGREGADO (ver conversación, "zapatas recortadas"): $holes es una
     * lista de contornos (cada uno como $points) que se RESTAN del
     * contorno exterior -- área, centroide e inercias del polígono NETO
     * (exterior menos huecos), no solo del exterior. Con $holes=[]
     * (el caso de siempre) el resultado es IDÉNTICO al de antes de este
     * cambio -- no se modifica ningún caso ya validado sin huecos.
     */
    private function polygonProperties(array $points, array $holes = []): array
    {
        [$a0, $xc, $yc, $ix0, $iy0, $ixy0] = $this->polygonRawTotals($points);

        foreach ($holes as $hole) {
            if (count($hole) < 3) {
                continue;
            }
            [$ha0, $hxc, $hyc, $hix0, $hiy0, $hixy0] = $this->polygonRawTotals($hole);
            $a0 -= $ha0;
            $xc -= $hxc;
            $yc -= $hyc;
            $ix0 -= $hix0;
            $iy0 -= $hiy0;
            $ixy0 -= $hixy0;
        }

        // OJO: el área con signo (antes de abs()) es la que hay que usar para
        // dividir XC/YC — es la fórmula estándar del centroide de un polígono.
        // Envolver el resultado final en abs() (como estaba antes) descarta en
        // qué cuadrante cae el centroide respecto al origen, lo cual rompe el
        // centrado del polígono en calcularZapatas2EnPhp() cuando el centroide
        // real tiene X o Y negativa.
        $signedArea = $a0 / 2;
        $area = abs($signedArea);
        // IX/IY son magnitudes físicas (siempre >=0), así que abs() las
        // normaliza sin importar el sentido de dibujo (horario/antihorario)
        // del polígono. IXY en cambio SÍ puede ser negativo de verdad (según
        // en qué cuadrantes esté repartido el material) — abs() lo hubiera
        // arruinado, así que en vez de eso se corrige el signo según el
        // sentido de dibujo (mismo criterio que ya usa signedArea/area).
        $windingSign = $signedArea >= 0.0 ? 1 : -1;
        return [
            'A' => $area,
            'XC' => $signedArea != 0.0 ? $xc / (6 * $signedArea) : 0.0,
            'YC' => $signedArea != 0.0 ? $yc / (6 * $signedArea) : 0.0,
            'IX' => abs($ix0 / 12),
            'IY' => abs($iy0 / 12),
            'IXY' => $windingSign * $ixy0 / 24,
        ];
    }

    // AGREGADO (ver conversación, "zapatas recortadas"): $holes excluye de
    // la nube de puntos cualquier posición que caiga dentro de alguno de
    // esos contornos -- mismo criterio que ya usaba zapatas.m (1 exterior
    // + N interiores) para la zapata aislada vieja, ahora disponible acá
    // para zapatas2 (múltiples columnas, propiedades reales). Con
    // $holes=[] (el caso de siempre) es idéntico a antes.
    private function polygonGrid(array $points, array $holes = []): array
    {
        $xs = array_column($points, 0);
        $ys = array_column($points, 1);
        $rangeX = max($xs) - min($xs);
        $rangeY = max($ys) - min($ys);
        $total = 320;
        $nx = max(2, (int) round($total * ($rangeX / max($rangeX + $rangeY, 0.000001))));
        $ny = max(2, $total - $nx);
        $grid = [];

        for ($ix = 0; $ix < $nx; $ix++) {
            $x = min($xs) + ($rangeX * $ix / max($nx - 1, 1));
            for ($iy = 0; $iy < $ny; $iy++) {
                $y = min($ys) + ($rangeY * $iy / max($ny - 1, 1));
                if (!$this->pointInPolygon($x, $y, $points)) {
                    continue;
                }
                if ($this->pointInAnyPolygon($x, $y, $holes)) {
                    continue;
                }
                $grid[] = [$x, $y];
            }
        }

        return $grid;
    }

    private function pointInAnyPolygon(float $x, float $y, array $polygons): bool
    {
        foreach ($polygons as $polygon) {
            if (count($polygon) >= 3 && $this->pointInPolygon($x, $y, $polygon)) {
                return true;
            }
        }
        return false;
    }

    private function pointInPolygon(float $x, float $y, array $polygon): bool
    {
        $inside = false;
        for ($i = 0, $j = count($polygon) - 1; $i < count($polygon); $j = $i++) {
            [$xi, $yi] = $polygon[$i];
            [$xj, $yj] = $polygon[$j];
            $cross = ($x - $xi) * ($yj - $yi) - ($y - $yi) * ($xj - $xi);
            $withinSegment = $x >= min($xi, $xj) - 0.000001
                && $x <= max($xi, $xj) + 0.000001
                && $y >= min($yi, $yj) - 0.000001
                && $y <= max($yi, $yj) + 0.000001;

            if (abs($cross) < 0.000001 && $withinSegment) {
                return true;
            }

            $intersects = (($yi > $y) !== ($yj > $y)) && ($x < ($xj - $xi) * ($y - $yi) / (($yj - $yi) ?: 0.000001) + $xi);
            if ($intersects) {
                $inside = !$inside;
            }
        }
        return $inside;
    }

    public function calcularFuerzasArmaduras(Request $request)
    {
        $function = sprintf(
            "rigidez_armaduras(%s, %s, %s, %s, %s);",
            $request->input("nodos"),
            $request->input("barras"),
            $request->input("cargas"),
            $request->input("restringidos"),
            $request->input("propiedades"),
        );

        self::returnOctaveResult($function);
    }

    public function calcularFuerzasArmaduras3d(Request $request)
    {
        $function = sprintf(
            "rigidez_armaduras(%s, %s, %s, %s, %s);",
            $request->input("nodos"),
            $request->input("barras"),
            $request->input("cargas"),
            $request->input("restringidos"),
            $request->input("propiedades"),
        );

        self::returnOctaveResult($function);
    }

    public function calcularSuelos(Request $request)
    {
        $function = sprintf(
            "suelos(%s, %s, %s, %s);",
            $request->input("q"),
            $request->input("df"),
            $request->input("B"),
            $request->input("L"),
        );

        self::returnOctaveResult($function);
    }
}
