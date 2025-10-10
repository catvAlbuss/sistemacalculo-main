export const perfilSueloTipo = [
  {
    valor_s: 's0',
    tipo: 'Roca Dura',
    vs: '> 1500m/s',
    s: 0.8,
    tp: 0.3,
    n60: '-',
    tl: 3,
    su: '-',
    qu: '-',
    text: 'Roca Dura: Rocas Sanas, cuando se conoce que la roca dura es continua hasta una profundidad de 30m.',
  },
  {
    valor_s: 's1',
    tipo: 'Roca Rigida',
    vs: '500m/s a 1500m/s',
    s: 1,
    tp: 0.4,
    n60: '> 50',
    tl: 2.5,
    su: '> 100 kpa',
    qu: '5 kg/cm2 a 1 kg/cm2',
    text: 'Rocas o Suelos muy rígidos: Roca fracturada, arena muy densa o grava arenosa densa, arcilla muy compacta (de espesor menor que 20).',
  },
  {
    valor_s: 's2',
    tipo: 'Suelo Intermedio',
    vs: '180m/s a 500m/s',
    s: 1.15,
    tp: 0.6,
    n60: '15 a 50',
    tl: 2,
    su: '50 kpa a 100 kpa',
    qu: '1 kg/cm2 a 0.5 kg/cm2',
    text: 'Suelos intermedios: Suelos medianamente rígidos, arena densa, gruesa a media, o grava arenosa medianamente densa, suelo cohesivo compacto.',
  },
  {
    valor_s: 's3',
    tipo: 'Suelos Blandos',
    vs: '180m/s a 500m/s',
    s: 1.2,
    tp: 1,
    n60: '< 15',
    tl: 1.6,
    su: '25 kpa a 50 kpa',
    qu: '0.5 kg/cm2 a 0.25 kg/cm2',
    text: 'Suelos Blandos: Suelos flexibles, arena media a fina, o grava arenosa, suelo cohesivo blando, cualquier perfil diferente al tipo S4 y que tenga más de 3m de suelo.',
  },
];

export function cargarGeoCondition(
  valor,
  text,
  tipo,
  vs,
  s,
  tp,
  n60,
  tl,
  su,
  qu
) {
  perfilSueloTipo.map((perfil) => {
    if (perfil.valor_s == valor) {
      text.innerText = perfil.text;
      tipo.innerText = perfil.tipo;
      vs.innerText = perfil.vs;
      s.innerText = perfil.s;
      tp.innerText = perfil.tp;
      n60.innerText = perfil.n60;
      tl.innerText = perfil.tl;
      su.innerText = perfil.su;
      qu.innerText = perfil.qu;
    }
  });
}
