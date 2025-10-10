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
        $command = 'octave-cli --path ' . $MATLABS . ' --no-gui --no-history --norc --no-window-system --quiet --eval "' . $fun . '"';
        if (PHP_OS_FAMILY !== "Windows" && empty(glob("/usr/bin/octave*"))) {
            $command = "PATH=$SNAP/usr/sbin:$SNAP/usr/bin:$SNAP/sbin:$SNAP/bin:\$PATH " . $command;
            $process = proc_open($command, $DESCRIPTORSPEC, $pipes, null, $ENV);
        } else {
            $process = proc_open($command, $DESCRIPTORSPEC, $pipes);
        }
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
