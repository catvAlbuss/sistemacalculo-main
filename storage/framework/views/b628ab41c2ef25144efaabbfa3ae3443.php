<!-- resources/views/partials/resultadoLosasAligerdas.blade.php -->
<table id="desingcorte" class="min-w-full text-gray-800 dark:text-white">
    <?php
    // Al inicio de la vista, asegurar que base tenga valores válidos
    foreach ($base as $key => $value) {
    if ($base[$key] == 0) {
    $base[$key] = 40; // valor por defecto
    }
    }

    foreach ($altura as $key => $value) {
    if ($altura[$key] == 0) {
    $altura[$key] = 90; // valor por defecto
    }
    }
    ?>
    <!-- Requisitos de diseño vigas -->
    <thead class="bg-gray-200 dark:bg-gray-800">
        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
            <th class="text-xl py-2 px-4 text-left" colspan="4">1.- Requisitos de diseño</th>
        </tr>
        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
            <th class="text-lg py-2 px-4" scope="col">Nombre</th>
            <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
            <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
            <?php for($i = 1; $i <= $num_tramos; $i++): ?> <th scope="col">START</th>
                <th scope="col">MIDDLE</th>
                <th scope="col">END</th>
                <?php endfor; ?>
        </tr>
    </thead>
    <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Luz libre</td>
            <td class='py-2 px-4'>LL</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($luzLibre[ceil($i / 3)]); ?> m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Carga Muerta</td>
            <td class='py-2 px-4'>CM</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($CM[ceil($i / 3)]); ?> Ton. m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Carga Viva</td>
            <td class='py-2 px-4'>CV</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($Cv[ceil($i / 3)]); ?> Ton. m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Base de la losa</td>
            <td class='py-2 px-4'>Base</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($base[ceil($i / 3)]); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Altura de la losa</td>
            <td class='py-2 px-4'>h</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($altura[ceil($i / 3)]); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Ancho tributario vigueta</td>
            <td class='py-2 px-4'>b</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($bp[ceil($i / 3)]); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Momento lado izquierdo</td>
            <td class='py-2 px-4'>Mi</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($Mi[ceil($i / 3)]); ?> Tonf-m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Momento lado derecho</td>
            <td class='py-2 px-4'>Md</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($Md[ceil($i / 3)]); ?> Tonf-m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Deflección debido a la carga muerta</td>
            <td class='py-2 px-4'>δ1</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($did1[ceil($i / 3)]); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Deflección debido a la carga viva</td>
            <td class='py-2 px-4'>δ2</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($did2[ceil($i / 3)]); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Deflección debido al 30% de la carga viva</td>
            <td class='py-2 px-4'>δ3</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($did3[ceil($i / 3)]); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
    </tbody>

    <!-- Valores negativos -->
    <thead class="bg-gray-200 dark:bg-gray-800">
        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
            <th class="text-xm py-2 px-4 text-left" colspan="4">1.1- Valores negativos</th>
        </tr>
        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
            <th class="text-lg py-2 px-4" scope="col">Nombre</th>
            <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
            <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
            <?php for($i = 1; $i <= $num_tramos; $i++): ?> <th scope="col">START</th>
                <th scope="col">MIDDLE</th>
                <th scope="col">END</th>
                <?php endfor; ?>
        </tr>
    </thead>
    <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Momento ultimo negativo</td>
            <td class='py-2 px-4'>Mu(-)</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($mu[ceil($i)]); ?> m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Momento ultimo negativo</td>
            <td class='py-2 px-4'>Mu(-)</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($mu[ceil($i)]); ?> m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Fuerza cortante (-)</td>
            <td class='py-2 px-4'>VU -</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($vu[ceil($i)]); ?> Tn-m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Torsión (-)</td>
            <td class='py-2 px-4'>TU -</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($tu[ceil($i)]); ?> Tn-m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
    </tbody>

    <!-- Valores positivos -->
    <thead class="bg-gray-200 dark:bg-gray-800">
        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
            <th class="text-xm py-2 px-4 text-left" colspan="4">1.2- Valores positivos</th>
        </tr>
        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
            <th class="text-lg py-2 px-4" scope="col">Nombre</th>
            <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
            <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
            <?php for($i = 1; $i <= $num_tramos; $i++): ?> <th scope="col">START</th>
                <th scope="col">MIDDLE</th>
                <th scope="col">END</th>
                <?php endfor; ?>
        </tr>
    </thead>
    <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Momento ultimo positivo</td>
            <td class='py-2 px-4'>Mu(+)</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($mu_[ceil($i)]); ?> Tn-m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Fuerza cortante (+)</td>
            <td class='py-2 px-4'>VU +</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($vu_[ceil($i)]); ?> Tn-m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Torsión (+)</td>
            <td class='py-2 px-4'>TU +</td>
            <td class='py-2 px-4'>-</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'><?php echo e($tu_[ceil($i)]); ?> Tn-m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
    </tbody>

    <!-- Diseño por flexion -->

    <thead class="bg-gray-200 dark:bg-gray-800">
        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
            <th class="text-xl py-2 px-4 text-left" colspan="4">2.- Diseño por flexion</th>
        </tr>
        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
            <th class="text-lg py-2 px-4" scope="col">Nombre</th>
            <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
            <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
            <?php for($i = 1; $i <= $num_tramos; $i++): ?> <th scope="col">START</th>
                <th scope="col">MIDDLE</th>
                <th scope="col">END</th>
                <?php endfor; ?>
        </tr>
    </thead>
    <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <td class='py-2 px-4'>Peralte efectivo</td>
            <td class='py-2 px-4'>d</td>
            <td class='py-2 px-4'>h - 3</td>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $d[$i] = $altura[ceil(($i / 3))] - 3;
            ?>
            <td class='py-2 px-4'><?php echo e($d[$i]); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row">(*) Dimensión característica de la sección transversal</th>
            <th class="text-lg py-2 px-4" scope="row">a</th>
            <th class="text-lg py-2 px-4" scope="row">d-(d²-2*|MU*10^5|/(0.90*0.85*f'c*base))^0.5</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $d_value = $d[ceil(($i / 3))];
            $base_value = $base[ceil(($i / 3))];
            $q4 = pow($d_value, 2) - 2 * ABS($mu[$i] * pow(10, 5)) / (0.90 * 0.85 * $fc * $base_value);
            $a = round($d_value - sqrt(pow($d_value, 2) - 2 * ABS($mu[$i] * pow(10, 5)) / (0.90 * 0.85 * $fc * $base_value)), 2, PHP_ROUND_HALF_UP);
            ?>
            <?php if($q4 > 0): ?>
            <td class='py-2 px-4'><?php echo e($a); ?> cm</td>
            <?php else: ?>
            <td class='py-2 px-4'>Ráiz de negativos</td>
            <?php endif; ?>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row">Refuerzo usado en claro (*)</th>
            <th class="text-lg py-2 px-4" scope="row">As</th>
            <th class="text-lg py-2 px-4" scope="row">(0.85 * f'c * base * a) / Fy (*)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $FR = 0.90;
            $d_value = $altura[ceil(($i / 3))] - 3;
            $base_value = $base[ceil(($i / 3))];
            $a = round($d_value - sqrt(pow($d_value, 2) - 2 * abs($mu[$i] * pow(10, 5)) / ($FR * 0.85 * $fc * $base_value)), 2, PHP_ROUND_HALF_UP);
            $As = round(((0.85 * $fc * $base_value * $a) / $fy), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($As); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row">(*)</th>
            <th class="text-lg py-2 px-4" scope="row">As min</th>
            <th class="text-lg py-2 px-4" scope="row">max(0.7*(f'c)^0.5/Fy*base*d, 14*base*$d/Fy)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $As_min = round(max(0.7 * sqrt($fc) / $fy * $base_value * $d_value, 14 * $base_value * $d_value / $fy), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($As_min); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row">As Balanceado (*)</th>
            <th class="text-lg py-2 px-4" scope="row">As Balanceado</th>
            <th class="text-lg py-2 px-4" scope="row">(0.85 * β1 * f'c / Fy * (0.003 / (0.003 + 0.0021))) * base * d</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $β1 = 0.85;
            $As_maxbal = round((0.85 * $β1 * $fc / $fy * (0.003 / (0.003 + 0.0021))) * $base_value * $d_value, 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($As_maxbal); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row">As Max 75%Abs (*)</th>
            <th class="text-lg py-2 px-4" scope="row">As Max 75%Abs</th>
            <th class="text-lg py-2 px-4" scope="row">0.75 * (0.85 * β1 * f'c / fy * (0.003 / (0.003 + 0.0021))) * base * d</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $β1 = 0.85;
            $As_maxabs = round(0.75 * (0.85 * $β1 * $fc / $fy * (0.003 / (0.003 + 0.0021))) * $base_value * $d_value, 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($As_maxabs); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- As Usar (cm²) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row">As Usar (*)</th>
            <th class="text-lg py-2 px-4" scope="row">As Usar</th>
            <th class="text-lg py-2 px-4" scope="row">(condicional)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $As_usar = 0;
            if ($As < $As_min) {
                $As_usar=$As_min;
                } else {
                if ($As> $As_min || $As < $As_maxabs) {
                    $As_usar=$As;
                    } else {
                    $As_usar=$As_maxabs;
                    }
                    }

                    ?>
                    <td class='py-2 px-4'><?php echo e($As_usar); ?> cm²s</td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row">Área de acero</th>
            <th class="text-lg py-2 px-4" scope="row">Aceros</th>
            <th class="text-lg py-2 px-4" scope="row">diámetro</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td>
                <select class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md aceroSelectA" data-column="<?php echo $i; ?>" name="aceroSelectA<?php echo $i; ?>" id="aceroSelectA<?php echo $i; ?>">
                    <option value="0;<?php echo $num_tramos; ?>">Ø 0"</option>
                    <option value="0.283;<?php echo $num_tramos; ?>">6mm</option>
                    <option value="0.503;<?php echo $num_tramos; ?>">8mmm cm²</option>
                    <option value="0.713;<?php echo $num_tramos; ?>">Ø3/8" cm²</option>
                    <option value="1.131;<?php echo $num_tramos; ?>">12 mmm cm²</option>
                    <option value="1.267;<?php echo $num_tramos; ?>">Ø1/2" cm²</option>
                    <option value="1.979;<?php echo $num_tramos; ?>">Ø5/8" cm²</option>
                    <option value="2.85;<?php echo $num_tramos; ?>">Ø3/4" cm²</option>
                    <option value="5.067;<?php echo $num_tramos; ?>">Ø 1" cm²</option>
                    <option value="2.58;<?php echo $num_tramos; ?>">2Ø1/2"</option>
                    <option value="3.87;<?php echo $num_tramos; ?>">3Ø1/2"</option>
                    <option value="3.98;<?php echo $num_tramos; ?>">2Ø5/8"</option>
                    <option value="5.16;<?php echo $num_tramos; ?>">4Ø1/2"</option>
                    <option value="5.27;<?php echo $num_tramos; ?>">2Ø5/8"+1Ø1/2"</option>
                    <option value="5.68;<?php echo $num_tramos; ?>">2Ø3/4"</option>
                    <option value="5.97;<?php echo $num_tramos; ?>">3Ø5/8"</option>
                    <option value="6.45;<?php echo $num_tramos; ?>">5Ø1/2"</option>
                    <option value="6.56;<?php echo $num_tramos; ?>">2Ø5/8"+2Ø1/2"</option>
                    <option value="6.97;<?php echo $num_tramos; ?>">2Ø3/4"+1Ø1/2"</option>
                    <option value="7.67;<?php echo $num_tramos; ?>">2Ø3/4"+1Ø5/8"</option>
                    <option value="7.74;<?php echo $num_tramos; ?>">6Ø1/2"</option>
                    <option value="7.85;<?php echo $num_tramos; ?>">2Ø5/8"+3Ø1/2"</option>
                    <option value="7.96;<?php echo $num_tramos; ?>">4Ø5/8"</option>
                    <option value="8.26;<?php echo $num_tramos; ?>">2Ø3/4"+2Ø1/2"</option>
                    <option value="8.52;<?php echo $num_tramos; ?>">3Ø3/4"</option>
                    <option value="8.55;<?php echo $num_tramos; ?>">3Ø5/8"+2Ø1/2"</option>
                    <option value="9.55;<?php echo $num_tramos; ?>">2Ø3/4"+3Ø1/2"</option>
                    <option value="9.95;<?php echo $num_tramos; ?>">5Ø5/8"</option>
                    <option value="9.66;<?php echo $num_tramos; ?>">2Ø3/4"+2Ø5/8"</option>
                    <option value="10.2;<?php echo $num_tramos; ?>">2Ø1"</option>
                    <option value="10.54;<?php echo $num_tramos; ?>">4Ø5/8"+2Ø1/2"</option>
                    <option value="10.84;<?php echo $num_tramos; ?>">2Ø3/4"+4Ø1/2"</option>
                    <option value="11.1;<?php echo $num_tramos; ?>">3Ø3/4"+2Ø1/2"</option>
                    <option value="11.36;<?php echo $num_tramos; ?>">4Ø3/4"</option>
                    <option value="11.65;<?php echo $num_tramos; ?>">2Ø3/4"+3Ø5/8"</option>
                    <option value="11.94;<?php echo $num_tramos; ?>">6Ø5/8"</option>
                    <option value="12.19;<?php echo $num_tramos; ?>">2Ø1"+1Ø5/8"</option>
                    <option value="12.5;<?php echo $num_tramos; ?>">3Ø3/4"+2Ø5/8"</option>
                    <option value="13.04;<?php echo $num_tramos; ?>">2Ø1"+1Ø3/4"</option>
                    <option value="13.64;<?php echo $num_tramos; ?>">2Ø3/4"+4Ø5/8"</option>
                    <option value="13.94;<?php echo $num_tramos; ?>">4Ø3/4"+2Ø1/2"</option>
                    <option value="14.18;<?php echo $num_tramos; ?>">2Ø1"+2Ø5/8"</option>
                    <option value="14.2;<?php echo $num_tramos; ?>">5Ø3/4"</option>
                    <option value="15.3;<?php echo $num_tramos; ?>">3Ø1"</option>
                    <option value="15.34;<?php echo $num_tramos; ?>">4Ø3/4"+2Ø5/8"</option>
                    <option value="15.88;<?php echo $num_tramos; ?>">2Ø1"+2Ø3/4"</option>
                    <option value="16.17;<?php echo $num_tramos; ?>">2Ø1"+3Ø5/8"</option>
                    <option value="17.04;<?php echo $num_tramos; ?>">6Ø3/4"</option>
                    <option value="18.16;<?php echo $num_tramos; ?>">2Ø1"+4Ø5/8"</option>
                    <option value="18.72;<?php echo $num_tramos; ?>">2Ø1"+3Ø3/4"</option>
                    <option value="19.28;<?php echo $num_tramos; ?>">3Ø1"+2Ø5/8"</option>
                    <option value="20.4;<?php echo $num_tramos; ?>">4Ø1"</option>
                    <option value="20.98;<?php echo $num_tramos; ?>">3Ø1"+2Ø3/4"</option>
                    <option value="21.56;<?php echo $num_tramos; ?>">2Ø1"+4Ø3/4"</option>
                    <option value="24.38;<?php echo $num_tramos; ?>">4Ø1"+2Ø5/8"</option>
                    <option value="25.5;<?php echo $num_tramos; ?>">5Ø1"</option>
                    <option value="26.08;<?php echo $num_tramos; ?>">4Ø1"+2Ø3/4"</option>
                    <option value="30.6;<?php echo $num_tramos; ?>">6Ø1"</option>
                </select>
                <!-- <input class="aceroInputA" data-column="<?php /* echo $i */; ?>" type="number" value="1" id="aceroInputA<?php /* echo $i */; ?>" name="aceroInputA<?php /* echo $i */; ?>"> -->
            </td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row" id="resultadosAceroA1">As Real (*)</th>
            <th class="text-lg py-2 px-4">As Real</th>
            <th class="text-lg py-2 px-4">(areaAcero * 3) + (areaAcero * 0)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class="text-lg py-2 px-4"></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            <!-- Td con resultados de los cambios en los valores select e input (js)-->
        </tr>
        <!-- ФMn (Tonf-m) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row" id="resultadosAceroA2">ФMn (*)</th>
            <th class="text-lg py-2 px-4">ФMn</th>
            <th class="text-lg py-2 px-4">(0.9 * (0.85 * fc * base * aReal) * (d - aReal / 2) / 100000)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class="text-lg py-2 px-4"></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Verif. -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class="text-lg py-2 px-4" scope="row" id="resultadosAceroA3">Verificación</th>
            <th class="text-lg py-2 px-4" scope="row" id="resultadosAceroA3">Verif.</th>
            <th class="text-lg py-2 px-4" scope="row" id="resultadosAceroA3">(condicional)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class="text-lg py-2 px-4"></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
    </tbody>

    <thead class="bg-gray-200 dark:bg-gray-800">
        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
            <th class="text-xl py-2 px-4 text-left" colspan="4">2.1.- Valores negativos (-)</th>
        </tr>
        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
            <th class="text-lg py-2 px-4" scope="col">Nombre</th>
            <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
            <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
            <?php for($i = 1; $i <= $num_tramos; $i++): ?> <th scope="col">START</th>
                <th scope="col">MIDDLE</th>
                <th scope="col">END</th>
                <?php endfor; ?>
        </tr>
    </thead>

    <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Mu(-)</th>
            <th class='py-2 px-4' scope="row">Mu(-)</th>
            <th class='py-2 px-4' scope="row">abs(mu / 3)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $mu_dividido = round(abs($mu[$i] / 3), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($mu_dividido); ?> Tnf.m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- </tr> -->
        <!-- Mu (-) usar (Tonf.m) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Mu (-) usar</th>
            <th class='py-2 px-4' scope="row">Mu (-) usar</th>
            <th class='py-2 px-4' scope="row">(condicional)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $mu_usar = 0;
            if ($mu_[$i] > $mu_dividido) {
            $mu_usar = $mu_[$i];
            } else {
            $mu_usar = $mu_dividido;
            }
            ?>
            <td class='py-2 px-4'><?php echo e($mu_usar); ?> Tnf.m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

        </tr>
        <!-- d+ (*)-->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Peralte efectivo d+</th>
            <th class='py-2 px-4' scope="row">d+</th>
            <th class='py-2 px-4' scope="row"> h -3 </th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $dsneg[$i] = $altura[ceil(($i / 3))] - 3;
            ?>
            <td class='py-2 px-4'><?php echo e($dsneg[$i]); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- a+ (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">a+ (*)</th>
            <th class='py-2 px-4' scope="row">a+</th>
            <th class='py-2 px-4' scope="row">d-(d²-2*|mu_usar*10^5|/(0.90*0.85*f'c*base))^0.5</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $base_value = $base[ceil(($i / 3))];
            $dsneg_value = $altura[ceil(($i / 3))] - 3;
            $q4_neg = pow($dsneg_value, 2) - 2 * ABS($mu_usar * pow(10, 5)) / (0.90 * 0.85 * $fc * $base_value);
            $a_neg = round($dsneg_value - sqrt(pow($dsneg_value, 2) - 2 * ABS($mu_usar * pow(10, 5)) / (0.90 * 0.85 * $fc * $base_value)), 2, PHP_ROUND_HALF_UP);
            ?>
            <?php if($q4_neg > 0): ?>
            <td class='py-2 px-4'><?php echo e($a_neg); ?> cm</td>
            <?php else: ?>
            <td class='py-2 px-4'>Ráiz de negativo</td>
            <?php endif; ?>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- As (cm²) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">As (*)</th>
            <th class='py-2 px-4' scope="row">As</th>
            <th class='py-2 px-4' scope="row">(0.85*f'c*base*a)/Fy</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $As1 = round(((0.85 * $fc * $base_value * $a_neg) / $fy), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($As1); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- As min (cm²) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">As min</th>
            <th class='py-2 px-4' scope="row">As min</th>
            <th class='py-2 px-4' scope="row">MAX(0.7 * (f'c)^0.5 / Fy *base*d, 14 * base * $d / Fy)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $As_min1 = round(MAX(0.7 * sqrt($fc) / $fy * $base_value * $dsneg_value, 14 * $base_value * $dsneg_value / $fy), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($As_min1); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- As Balanceado (cm²) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">As Balanceado</th>
            <th class='py-2 px-4' scope="row">As Balanceado</th>
            <th class='py-2 px-4' scope="row">(0.85 * β11 * f'c / Fy * (0.003 / (0.003 + 0.0021))) * base * $d</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $β11 = 0.85;
            $As_maxbal1 = round((0.85 * $β11 * $fc / $fy * (0.003 / (0.003 + 0.0021))) * $base_value * $dsneg_value, 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($As_maxbal1); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- As Max 75%Abs (cm²) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">As Max 75%Abs</th>
            <th class='py-2 px-4' scope="row">As Max 75%Abs</th>
            <th class='py-2 px-4' scope="row">0.75 * (0.85 * β11 * f'c / Fy * (0.003 / (0.003 + 0.0021))) * base * d</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $β11 = 0.85;
            $As_maxabs1 = round(0.75 * (0.85 * $β11 * $fc / $fy * (0.003 / (0.003 + 0.0021))) * $base_value * $dsneg_value, 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($As_maxabs1); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- As Usar (cm²) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">As Usar</th>
            <th class='py-2 px-4' scope="row">As Usar</th>
            <th class='py-2 px-4' scope="row">0.75 * (0.85 * β11 * f'c / Fy * (0.003 / (0.003 + 0.0021))) * base * $d</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $As_usar1 = 0;
            if ($As1 < $As_min1) {
                $As_usar1=$As_min1;
                } else {
                if ($As1> $As_min1 || $As < $As_maxabs1) {
                    $As_usar1=$As1;
                    } else {
                    $As_usar1=$As_maxabs1;
                    }
                    }
                    ?>
                    <td class='py-2 px-4'><?php echo e($As_usar1); ?> cm²</td>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Aceros B selects and inputs -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Área de acero</th>
            <th class='py-2 px-4' scope="row">Aceros</th>
            <th class='py-2 px-4' scope="row">diámetro</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'>
                <select class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md aceroSelectB" data-column="<?php echo $i; ?>" name="aceroSelectB<?php echo $i; ?>" id="aceroSelectB<?php echo $i; ?>">
                    <option value="0;<?php echo $num_tramos; ?>">Ø 0"</option>
                    <option value="0.283;<?php echo $num_tramos; ?>">6mm</option>
                    <option value="0.503;<?php echo $num_tramos; ?>">8mmm cm²</option>
                    <option value="0.713;<?php echo $num_tramos; ?>">Ø3/8" cm²</option>
                    <option value="1.131;<?php echo $num_tramos; ?>">12 mmm cm²</option>
                    <option value="1.267;<?php echo $num_tramos; ?>">Ø1/2" cm²</option>
                    <option value="1.979;<?php echo $num_tramos; ?>">Ø5/8" cm²</option>
                    <option value="2.85;<?php echo $num_tramos; ?>">Ø3/4" cm²</option>
                    <option value="5.067;<?php echo $num_tramos; ?>">Ø 1" cm²</option>
                    <option value="2.58;<?php echo $num_tramos; ?>">2Ø1/2"</option>
                    <option value="3.87;<?php echo $num_tramos; ?>">3Ø1/2"</option>
                    <option value="3.98;<?php echo $num_tramos; ?>">2Ø5/8"</option>
                    <option value="5.16;<?php echo $num_tramos; ?>">4Ø1/2"</option>
                    <option value="5.27;<?php echo $num_tramos; ?>">2Ø5/8"+1Ø1/2"</option>
                    <option value="5.68;<?php echo $num_tramos; ?>">2Ø3/4"</option>
                    <option value="5.97;<?php echo $num_tramos; ?>">3Ø5/8"</option>
                    <option value="6.45;<?php echo $num_tramos; ?>">5Ø1/2"</option>
                    <option value="6.56;<?php echo $num_tramos; ?>">2Ø5/8"+2Ø1/2"</option>
                    <option value="6.97;<?php echo $num_tramos; ?>">2Ø3/4"+1Ø1/2"</option>
                    <option value="7.67;<?php echo $num_tramos; ?>">2Ø3/4"+1Ø5/8"</option>
                    <option value="7.74;<?php echo $num_tramos; ?>">6Ø1/2"</option>
                    <option value="7.85;<?php echo $num_tramos; ?>">2Ø5/8"+3Ø1/2"</option>
                    <option value="7.96;<?php echo $num_tramos; ?>">4Ø5/8"</option>
                    <option value="8.26;<?php echo $num_tramos; ?>">2Ø3/4"+2Ø1/2"</option>
                    <option value="8.52;<?php echo $num_tramos; ?>">3Ø3/4"</option>
                    <option value="8.55;<?php echo $num_tramos; ?>">3Ø5/8"+2Ø1/2"</option>
                    <option value="9.55;<?php echo $num_tramos; ?>">2Ø3/4"+3Ø1/2"</option>
                    <option value="9.95;<?php echo $num_tramos; ?>">5Ø5/8"</option>
                    <option value="9.66;<?php echo $num_tramos; ?>">2Ø3/4"+2Ø5/8"</option>
                    <option value="10.2;<?php echo $num_tramos; ?>">2Ø1"</option>
                    <option value="10.54;<?php echo $num_tramos; ?>">4Ø5/8"+2Ø1/2"</option>
                    <option value="10.84;<?php echo $num_tramos; ?>">2Ø3/4"+4Ø1/2"</option>
                    <option value="11.1;<?php echo $num_tramos; ?>">3Ø3/4"+2Ø1/2"</option>
                    <option value="11.36;<?php echo $num_tramos; ?>">4Ø3/4"</option>
                    <option value="11.65;<?php echo $num_tramos; ?>">2Ø3/4"+3Ø5/8"</option>
                    <option value="11.94;<?php echo $num_tramos; ?>">6Ø5/8"</option>
                    <option value="12.19;<?php echo $num_tramos; ?>">2Ø1"+1Ø5/8"</option>
                    <option value="12.5;<?php echo $num_tramos; ?>">3Ø3/4"+2Ø5/8"</option>
                    <option value="13.04;<?php echo $num_tramos; ?>">2Ø1"+1Ø3/4"</option>
                    <option value="13.64;<?php echo $num_tramos; ?>">2Ø3/4"+4Ø5/8"</option>
                    <option value="13.94;<?php echo $num_tramos; ?>">4Ø3/4"+2Ø1/2"</option>
                    <option value="14.18;<?php echo $num_tramos; ?>">2Ø1"+2Ø5/8"</option>
                    <option value="14.2;<?php echo $num_tramos; ?>">5Ø3/4"</option>
                    <option value="15.3;<?php echo $num_tramos; ?>">3Ø1"</option>
                    <option value="15.34;<?php echo $num_tramos; ?>">4Ø3/4"+2Ø5/8"</option>
                    <option value="15.88;<?php echo $num_tramos; ?>">2Ø1"+2Ø3/4"</option>
                    <option value="16.17;<?php echo $num_tramos; ?>">2Ø1"+3Ø5/8"</option>
                    <option value="17.04;<?php echo $num_tramos; ?>">6Ø3/4"</option>
                    <option value="18.16;<?php echo $num_tramos; ?>">2Ø1"+4Ø5/8"</option>
                    <option value="18.72;<?php echo $num_tramos; ?>">2Ø1"+3Ø3/4"</option>
                    <option value="19.28;<?php echo $num_tramos; ?>">3Ø1"+2Ø5/8"</option>
                    <option value="20.4;<?php echo $num_tramos; ?>">4Ø1"</option>
                    <option value="20.98;<?php echo $num_tramos; ?>">3Ø1"+2Ø3/4"</option>
                    <option value="21.56;<?php echo $num_tramos; ?>">2Ø1"+4Ø3/4"</option>
                    <option value="24.38;<?php echo $num_tramos; ?>">4Ø1"+2Ø5/8"</option>
                    <option value="25.5;<?php echo $num_tramos; ?>">5Ø1"</option>
                    <option value="26.08;<?php echo $num_tramos; ?>">4Ø1"+2Ø3/4"</option>
                    <option value="30.6;<?php echo $num_tramos; ?>">6Ø1"</option>
                </select>
                <!-- <input class="aceroInputB" data-column="<?php /* echo $i */; ?>" type="number" value="1" id="aceroInputB<?php /* echo $i */; ?>" name="aceroInputB<?php /* echo $i */; ?>"> -->
            </td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- As Real (cm²) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row" id="resultadosAceroB1">As Real</th>
            <th class='py-2 px-4' scope="row" id="resultadosAceroB1">As Real</th>
            <th class='py-2 px-4' scope="row" id="resultadosAceroB1">(areaAcero * 3) + (areaAcero * 0)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            <?php
            ?>
        </tr>
        <!-- ФMn (Tonf-m) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row" id="resultadosAceroB2">ФMn</th>
            <th class='py-2 px-4' scope="row" id="resultadosAceroB2">ФMn</th>
            <th class='py-2 px-4' scope="row" id="resultadosAceroB2">0.90 * (0.85 * fc * base * aReal1) * (d1 - aReal1 / 2) / 100000</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Verif. -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row" id="resultadosAceroB3">Verificación</th>
            <th class='py-2 px-4'>Verif.</th>
            <th class='py-2 px-4'>(condicional)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
    </tbody>

    <!-----===============DISEÑO POR CORTE LOSA ===============-->
    <thead class="bg-gray-200 dark:bg-gray-800">
        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
            <th class="text-xl py-2 px-4 text-left" colspan="4">3.- Diseño de losa por corte</th>
        </tr>
        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
            <th class="text-lg py-2 px-4" scope="col">Nombre</th>
            <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
            <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
            <?php for($i = 1; $i <= $num_tramos; $i++): ?> <th scope="col">START</th>
                <th scope="col">MIDDLE</th>
                <th scope="col">END</th>
                <?php endfor; ?>
        </tr>
    </thead>
    <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
        <!-- Acw (cm²) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Acw</th>
            <th class='py-2 px-4' scope="row">Acw</th>
            <th class='py-2 px-4' scope="row">base * d</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $acw[$i] = $base[ceil(($i / 3))] * $d[ceil(($i / 3))];
            ?>
            <td class='py-2 px-4'><?php echo e($acw[$i]); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- VC (Tonf-m) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">VC</th>
            <th class='py-2 px-4' scope="row">VC</th>
            <th class='py-2 px-4' scope="row">0.53 * (f'c)^0.5 * acw / 1000</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $vc[$i] = round(0.53 * sqrt($fc) * ($acw[$i]) / 1000, 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($vc[$i]); ?> Tonf.m</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Ø Vc -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Ø Vc</th>
            <th class='py-2 px-4' scope="row">Ø Vc</th>
            <th class='py-2 px-4' scope="row">0.85 * vc</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $vcfr[$i] = round(0.85 * $vc[$i], 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($vcfr[$i]); ?></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Vs (Tonf) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Vs</th>
            <th class='py-2 px-4' scope="row">Vs</th>
            <th class='py-2 px-4' scope="row">|( vu / 0.85) - vc|</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $VS[$i] = round(abs(($vu[$i] / 0.85) - $vc[$i]), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($VS[$i]); ?> Tonf</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- S(cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">S</th>
            <th class='py-2 px-4' scope="row">S</th>
            <th class='py-2 px-4' scope="row">|0.713 * Fy * d / (VS * 1000)|</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $Espacios = round(abs(0.713 * $fy * $d_value / ($VS[$i] * 1000)), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($Espacios); ?> Tonf</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- S=d/4 (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">S</th>
            <th class='py-2 px-4' scope="row">S</th>
            <th class='py-2 px-4' scope="row">d / 4</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $ped = $d[ceil(($i / 3))] / 4;
            ?>
            <td class='py-2 px-4'><?php echo e($ped); ?> Tonf</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Lconf (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Lconf</th>
            <th class='py-2 px-4' scope="row">Lconf</th>
            <th class='py-2 px-4' scope="row">2 * altura</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $Lconfi[$i] = 2 * $altura[ceil(($i / 3))];
            ?>
            <td class='py-2 px-4'><?php echo e($Lconfi[$i]); ?> Tonf</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Usar (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">UsarS</th>
            <th class='py-2 px-4' scope="row">UsarS</th>
            <th class='py-2 px-4' scope="row">min(S, s2, smax)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $S = 62;
            $s2 = 13.5;
            $smax = 10;
            $usarS[$i] = min($S, $s2, $smax);
            ?>
            <td class='py-2 px-4'><?php echo e($usarS[$i]); ?> Tonf</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

        </tr>
        <!-- # estribos zona conf. -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row"># estribos zona conf.</th>
            <th class='py-2 px-4' scope="row"># estribos zona conf.</th>
            <th class='py-2 px-4' scope="row">Lconfi / usarS</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $estribos = $Lconfi[$i] / $usarS[$i];
            ?>
            <td class='py-2 px-4'><?php echo e($estribos); ?> Tonf</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Verif. -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Verificación</th>
            <th class='py-2 px-4' scope="row">Verif.</th>
            <th class='py-2 px-4' scope="row">(condicional)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php

            $estribado = "";
            if ($VultimoPositivo < $vc[$i]) {
                $estribado="CUMPLE" ;
                }
                else {
                if ($Vultimonegativo < $vc[$i]) {
                $estribado="NO CUMPLE" ;
                } else {
                $estribado="CUMPLE" ;
                }

                $estribado="NO CUMPLE" ;
                }
                ?>
                <td class='py-2 px-4'><?php echo e($estribado); ?> Tonf</td>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
    </tbody>

    <thead class="bg-gray-200 dark:bg-gray-800">
        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
            <th class="text-xl py-2 px-4 text-left" colspan="4">3.- Diseño por deflexión</th>
        </tr>
        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
            <th class="text-lg py-2 px-4" scope="col">Nombre</th>
            <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
            <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
            <?php for($i = 1; $i <= $num_tramos; $i++): ?> <th scope="col">START</th>
                <th scope="col">MIDDLE</th>
                <th scope="col">END</th>
                <?php endfor; ?>
        </tr>
    </thead>
    <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Relación modular</th>
            <th class='py-2 px-4' scope="row">n</th>
            <th class='py-2 px-4' scope="row">Es / Ec</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            /* Ec */
            $EC = 15000 * sqrt($fc);
            /* Es */
            $ES = 2000000;
            /* Mcr */
            $Mcr = 405 / 1000;
            /* lg */
            $lg = 22700 * pow(10, -8);
            $bf = 0;

            $Ma_value = $cargaMuerta[ceil(($i / 3))] + $cargaViva[ceil(($i / 3))];
            // Evitar división por cero
            if ($Ma_value == 0) {
                $Ma_value = 0.001;
            }
            
            $ddef_value = ($altura[ceil(($i / 3))] - 3) / 100;
            $baseP_value = $bp[ceil(($i / 3))] / 100;
            $BaseM_value = $base[ceil(($i / 3))] / 100;

            $n_value = round($ES / $EC, 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($n_value); ?> </td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- As (cm²) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Refuerzo usado en claro</th>
            <th class='py-2 px-4' scope="row">As</th>
            <th class='py-2 px-4' scope="row">1.98</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $Asd_value = round(1.98, 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($Asd_value); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- c (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Altura comprimido</th>
            <th class='py-2 px-4' scope="row">c</th>
            <th class='py-2 px-4' scope="row">((-n * As * 10^-4 + ( ( n * As * 10^-4)² - 4 * ((base/100) / 2) * (-n * As * 10^-4 * (d/100) ) )^0.5 )) / (2 * (base/100) / 2) * 100</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $q4def = pow($n_value * $Asd_value * pow(10, -4), 2) - 4 * ($BaseM_value / 2) * (-$n_value * $Asd_value * pow(10, -4) * $ddef_value);
            $CAl_value = round(((-$n_value * $Asd_value * pow(10, -4) + sqrt(pow($n_value * $Asd_value * pow(10, -4), 2) - 4 * ($BaseM_value / 2) * (-$n_value * $Asd_value * pow(10, -4) * $ddef_value)))) / (2 * $BaseM_value / 2) * 100, 2, PHP_ROUND_HALF_UP);
            ?>
            <?php if($q4def > 0): ?>
            <td class='py-2 px-4'><?php echo e($CAl_value); ?> cm</td>
            <?php else: ?>
            <td class='py-2 px-4'>Ráiz de negativo</td>
            <?php endif; ?>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Lcr (cm<sup>4</sup>) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Inercia crítica</th>
            <th class='py-2 px-4' scope="row">Lcr</th>
            <th class='py-2 px-4' scope="row">( b * c^3 ) / 3 + n * As * ( d - c)²</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $ICricicaM_value = round($baseP_value * (pow($CAl_value * pow(10, -2), 3)) / 3 + $n_value * $Asd_value * pow(10, -4) * pow($ddef_value - $CAl_value * pow(10, -2), 2), 10, PHP_ROUND_HALF_UP);
            $Icritica_value = round($ICricicaM_value * pow(10, 8), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($Icritica_value); ?> cm²</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Lef (cm<sup>4</sup>) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Lef</th>
            <th class='py-2 px-4' scope="row">Lef</th>
            <th class='py-2 px-4' scope="row">(Mcr/ma)^3 * lg + + (1 - (Mcr/Ma)^3 ) * lcr </th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $I = pow($Mcr / $Ma_value, 3) * $lg + (1 - pow($Mcr / $Ma_value, 3)) * $ICricicaM_value;
            $Linercia = round($I * pow(10, 8), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($Linercia); ?> cm<sup>4</sup></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- δt (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Deflexiones inmediatas dedibo al 100%CM y 100%CV</th>
            <th class='py-2 px-4' scope="row">δt</th>
            <th class='py-2 px-4' scope="row">5 * 5.98² / (48 * (EC * 10) * I) * (1.15 - 0.1 * (Mi + Md)) * 100</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $I = pow($Mcr / $Ma_value, 3) * $lg + (1 - pow($Mcr / $Ma_value, 3)) * $ICricicaM_value;
            $deflexionesT = round(5 * pow(5.98, 2) / (48 * ($EC * 10) * $I) * (1.15 - 0.1 * ($Mi[ceil(($i / 3))] + $Md[ceil(($i / 3))])) * 100, 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($deflexionesT); ?> cm<sup>4</sup></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- δt/30 (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">δt/30</th>
            <th class='py-2 px-4' scope="row">δt/30</th>
            <th class='py-2 px-4' scope="row">δ1 + δ3</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $deflexionesTmin = $did1[ceil(($i / 3))] + $did3[ceil(($i / 3))];
            ?>
            <td class='py-2 px-4'><?php echo e($deflexionesTmin); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- p´ (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Cuantía del acero en compresión</th>
            <th class='py-2 px-4' scope="row">p´</th>
            <th class='py-2 px-4' scope="row">100 * aceroColocado / (40*22)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $aceroColocado = 3.96;
            $pp = $aceroColocado / (40 * 22);
            $pprima = ($pp * 100);
            ?>
            <td class='py-2 px-4'><?php echo e($pprima); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- λ (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Deflección diferida</th>
            <th class='py-2 px-4' scope="row">λ</th>
            <th class='py-2 px-4' scope="row">2.00 / (1 + 50 * p')</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $aceroColocado = 3.96;
            $Ddiferida_value = round(2.00 / (1 + 50 * $pp), 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4'><?php echo e($Ddiferida_value); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Δcm (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">deflección diferida debido a la carga muerta</th>
            <th class='py-2 px-4' scope="row">Δcm</th>
            <th class='py-2 px-4' scope="row">λ * δ1</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $aceroColocado = 3.96;
            $DdiferidaCM_value = round($Ddiferida_value * $did1[ceil(($i / 3))], 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4' id='DdiferidaCM<?php echo e($i); ?>'><?php echo e($DdiferidaCM_value); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <!-- Δcv (cm) -->
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row">Deflección diferida debido al 30% de la carga viva</th>
            <th class='py-2 px-4' scope="row">Δcv</th>
            <th class='py-2 px-4' scope="row">λ * δ3</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
            $aceroColocado = 3.96;
            $DdiferidaCV_value = round($Ddiferida_value * $did3[ceil(($i / 3))], 2, PHP_ROUND_HALF_UP);
            ?>
            <td class='py-2 px-4' id='DdiferidaCV<?php echo e($i); ?>'><?php echo e($DdiferidaCV_value); ?> cm</td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' scope="row" colspan="2">CASOS</th>
            <th class='py-2 px-4' scope="row">Fórmula</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'>
                <select class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md casosSelectA" data-column="<?php echo $i; ?>" name="casosSelectA<?php echo $i; ?>" id="casosSelectA<?php echo $i; ?>">
                    <option value="0.5">Caso 1</option>
                    <option value="0.51">Caso 2</option>
                    <option value="1.97">Caso 3</option>
                    <option value="2">Caso 4</option>
                </select>
            </td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' id="casoResultA" scope="row">Deflección diferida debido a la carga muerta</th>
            <th class='py-2 px-4'>Δ (cm)</th>
            <th class='py-2 px-4'>(condicional)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' id="casoResultB" scope="row">Deflección máximo permitido</th>
            <th class='py-2 px-4' id="casoResultB" scope="row">Δmáx</th>
            <th class='py-2 px-4' id="casoResultB" scope="row">(condicional)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600 text-center">
            <th class='py-2 px-4' id="casoResultC" scope="row">Verificación</th>
            <th class='py-2 px-4' id="casoResultC" scope="row">Verif.</th>
            <th class='py-2 px-4' id="casoResultC" scope="row">(condicional)</th>
            <?php $__currentLoopData = range(1, $num_tramos * 3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <td class='py-2 px-4'></td>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tr>
    </tbody>
</table><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\hcalculo\resultadoLosasAligerdas.blade.php ENDPATH**/ ?>