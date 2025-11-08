// =================== CATÁLOGO ===================
const PRODUCTS = [
  {
    id: 'fiveseven',
    name: 'Five Seven',
    category: 'Pistola',
    price: 80000,
    weight: 2.75,
    batch: 1,
    materials: {
      'Alumínio': 180,
      'Cobre': 180,
      'Vidro': 215,
      'Plástico': 215,
      'Borracha': 215,
      'Corpo de pistola': 1,
      'Peças de armas': 3,
      'Engrenagem': 1,
      'Parafusos pequenos': 1,
      'Upgrade pistola': 1
    },
    materials_rules: {
      omit_on_entrega: ['Upgrade pistola'],
      omit_on_parceria_entrega: ['Upgrade pistola']
    }
  },
  {
    id: 'm1911',
    name: 'M1911',
    category: 'Pistola',
    price: 67000,
    weight: 2.25,
    batch: 1,
    materials: {
      'Alumínio': 150,
      'Cobre': 150,
      'Vidro': 175,
      'Corpo de pistola': 1,
      'Plástico': 175,
      'Borracha': 175,
      'Peças de armas': 3
    }
  },
  {
    id: 'muni_pt',
    name: 'Munição Pistola',
    category: 'Munições',
    price: 150,
    weight: 0.025,
    batch: 30,
    materials: {
      'Cobre': 15,
      'Frascos de pólvora': 3
    }
  },
  {
    id: 'muni_sub',
    name: 'Munição Sub',
    category: 'Munições',
    price: 225,
    weight: 0.025,
    batch: 30,
    materials: {
      'Alumínio': 15,
      'Cobre': 15,
      'Frascos de pólvora': 5
    }
  },
  {
    id: 'muni_rifle',
    name: 'Munição Rifle',
    category: 'Munições',
    price: 290,
    weight: 0.025,
    batch: 30,
    materials: {
      'Alumínio': 30,
      'Cobre': 30,
      'Frascos de pólvora': 8
    }
  }
];

const $ = (s) => document.querySelector(s);
const fmt = (v) =>
  '$' +
  Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
const clone = (o) => JSON.parse(JSON.stringify(o));

function calc() {
  const comprador = $('#comprador').value.trim() || '—';
  const faccao = $('#faccao').value.trim() || '—';
  const descontoPct = parseFloat($('#tipo').value || '0') || 0;
  const upgradeEntregue = $('#upgrade').checked;

  // Quantidades
  const qFS = parseInt($('#qty_fiveseven').value || '0', 10) || 0;
  const qM = parseInt($('#qty_m1911').value || '0', 10) || 0;
  const qMuniPT = parseInt($('#qty_muni_pt')?.value || '0', 10) || 0;
  const qMuniSub = parseInt($('#qty_muni_sub')?.value || '0', 10) || 0;
  const qMuniRifle = parseInt($('#qty_muni_rifle')?.value || '0', 10) || 0;

  const items = [];
  if (qFS > 0) items.push({ p: PRODUCTS.find((x) => x.id === 'fiveseven'), qty: qFS });
  if (qM > 0) items.push({ p: PRODUCTS.find((x) => x.id === 'm1911'), qty: qM });
  if (qMuniPT > 0) items.push({ p: PRODUCTS.find((x) => x.id === 'muni_pt'), qty: qMuniPT });
  if (qMuniSub > 0) items.push({ p: PRODUCTS.find((x) => x.id === 'muni_sub'), qty: qMuniSub });
  if (qMuniRifle > 0) items.push({ p: PRODUCTS.find((x) => x.id === 'muni_rifle'), qty: qMuniRifle });

  const excWrap = document.getElementById('excedentes-wrap');
  const matsBox = document.getElementById('materiais');
  const excBox = document.getElementById('excedentes');

  if (!items.length) {
    $('#resultado').innerHTML =
      '<p class="small">Preencha as quantidades e clique em <strong>Calcular</strong>.</p>';
    matsBox.textContent = '';
    excBox.textContent = '';
    excWrap.style.display = 'none';
    return;
  }

  const lines = [`${comprador} (${faccao})`];
  let subtotal = 0;
  let pesoTotal = 0;
  const mats = {};
  const excedentes = [];

  // Cálculo principal
  for (const { p, qty } of items) {
    const unitPrice = p.price * (1 - descontoPct / 100);
    const hasBatch = Number(p.batch) > 1;

    let producedBatches = 1;
    let produced = qty;
    let leftover = 0;

    if (hasBatch) {
      producedBatches = Math.ceil(qty / p.batch);
      produced = producedBatches * p.batch;
      leftover = produced - qty;
      excedentes.push({
        nome: p.name,
        produzido: produced,
        vendido: qty,
        sobra: leftover
      });
    }

    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    pesoTotal += (p.weight || 0) * qty;

    // Mostra número de batches no texto (ex: 45 (2) × Munição Pistola)
    const batchText = hasBatch && producedBatches > 1 ? ` (${producedBatches})` : '';
    lines.push(`• ${qty}${batchText} × ${p.name} = ${fmt(lineTotal)}`);

    // Materiais
    const mm = clone(p.materials);
    if (upgradeEntregue && mm['Upgrade pistola'] != null) delete mm['Upgrade pistola'];

    const multiplier = hasBatch ? producedBatches : qty;
    for (const [nome, base] of Object.entries(mm)) {
      mats[nome] = (mats[nome] || 0) + base * multiplier;
    }
  }

  // Totais
  let total = subtotal;
  if (upgradeEntregue) total -= 10000;
  if (total < 0) total = 0;
  const valorSujo = total * 1.3;

  // Resumo principal
  const resumoHtml =
    lines.join('\n') +
    '\n\n' +
    `Total <span class="text-total">${fmt(total)}</span> | ` +
    `Valor sujo <span class="text-sujo">${fmt(valorSujo)}</span> | ` +
    `Peso ${pesoTotal.toFixed(2)} kg`;

  $('#resultado').innerHTML = resumoHtml;

  // Materiais
  const matsText = Object.entries(mats)
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .map(([nome, qtd]) => `• ${nome}: ${qtd}`)
    .join('\n');
  matsBox.textContent = matsText || '—';

  // Excedentes
  if (excedentes.length > 0) {
    const excText = excedentes
      .map(
        (e) =>
          `• ${e.nome}: Produzido ${e.produzido} | Vendido ${e.vendido} | Excedente ${e.sobra}`
      )
      .join('\n');
    excBox.textContent = excText;
    excWrap.style.display = '';
  } else {
    excBox.textContent = '';
    excWrap.style.display = 'none';
  }
}

function clearAll() {
  $('#comprador').value = '';
  $('#faccao').value = '';
  $('#tipo').value = '0';
  $('#upgrade').checked = false;

  ['qty_fiveseven', 'qty_m1911', 'qty_muni_pt', 'qty_muni_sub', 'qty_muni_rifle'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '0';
  });

  $('#resultado').innerHTML =
    '<p class="small">Preencha as quantidades e clique em <strong>Calcular</strong>.</p>';
  document.getElementById('materiais').textContent = '';
  const excWrap = document.getElementById('excedentes-wrap');
  const excBox = document.getElementById('excedentes');
  excBox.textContent = '';
  excWrap.style.display = 'none';
}

document.getElementById('calcular').addEventListener('click', calc);
document.getElementById('limpar').addEventListener('click', clearAll);
