const fmtMoney = (n) => n.toLocaleString('en-US', {style:'currency', currency:'USD'});
const fmtKg = (n) => `${n.toFixed(2)} kg`;
const SUJO_FACTOR = 1.3;
let catalog = {};

async function loadCatalog(){
  const res = await fetch('products.json?v=' + Date.now(), {cache:'no-store'});
  catalog = await res.json();
  renderCategorias();
}
function renderCategorias(){
  const catWrap = document.getElementById('categorias');
  catWrap.innerHTML = '';
  // Agrupar por categoria
  const groups = {};
  Object.entries(catalog).forEach(([name, p]) => {
    const cat = p.category || 'Outros';
    (groups[cat] = groups[cat] || []).push([name, p]);
  });
  // Ordenar por nome da categoria
  Object.keys(groups).sort().forEach(catName => {
    // Sort products by name
    groups[catName].sort((a, b) => a[0].localeCompare(b[0]));
    const section = document.createElement('section');
    section.className = 'categoria';
    section.innerHTML = `<h3 class="categoria-title">${catName}</h3><div class="produtos"></div>`;
    const grid = section.querySelector('.produtos');
    groups[catName].forEach(([name, p]) => {
      const div = document.createElement('div');
      div.className = 'item';
      const precoNormal = p.prices?.normal ?? 0;
      const precoEntrega = p.prices?.entrega ?? null;
      const precoParceria = p.prices?.parceria ?? null;
      let pricesLine = `Normal: <strong>${fmtMoney(precoNormal)}</strong>`;
      if (precoEntrega != null) pricesLine += ` • Entrega: <strong>${fmtMoney(precoEntrega)}</strong>`;
      if (precoParceria != null) pricesLine += ` • Parceria: <strong>${fmtMoney(precoParceria)}</strong>`;
      div.innerHTML = `
        <h4>${name}</h4>
        <div class="field">
          <label>Quantidade</label>
          <input type="number" min="0" value="0" data-prod="${name}" class="qtd">
        </div>
      `;
      grid.appendChild(div);
    });
    catWrap.appendChild(section);
  });
}

function collectQuantities(){
  const inputs = document.querySelectorAll('.qtd');
  const q = {};
  inputs.forEach(inp => {
    const name = inp.dataset.prod;
    const val = parseInt(inp.value || '0', 10);
    if (val > 0) q[name] = val;
  });
  return q;
}
function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }

function calcular(){
  const buyer = (document.getElementById('comprador').value || '').trim();
  const faction = (document.getElementById('faccao').value || '').trim();
  const tipo = document.getElementById('tipo').value; // normal | entrega | parceria
  const q = collectQuantities();

  const lines = [];
  let total = 0;
  let totalWeight = 0;
  const mats = {};

  Object.entries(q).forEach(([name, qty]) => {
    const p = catalog[name];
    let unit = p.prices?.[tipo];
    if (unit == null) unit = p.prices?.normal || 0;
    const lineTotal = unit * qty;
    total += lineTotal;
    totalWeight += (p.weight || 0) * qty;

    // clona materiais
const pm = deepClone(p.materials || {});

// util: normaliza strings (remove acentos / case-insensitive)
const norm = s => (s || '')
  .toString()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

function omitByList(targetObj, list) {
  if (!list || !Array.isArray(list)) return;
  const keys = Object.keys(targetObj);
  const normKeys = keys.map(k => norm(k));
  list.forEach(entry => {
    const i = normKeys.indexOf(norm(entry));
    if (i >= 0) delete targetObj[keys[i]];
  });
}

// aplica regras de omissão
if (tipo === 'entrega' && p.materials_rules?.omit_on_entrega) {
  omitByList(pm, p.materials_rules.omit_on_entrega);
}
if (tipo === 'parceria_entrega' && p.materials_rules?.omit_on_parceria_entrega) {
  omitByList(pm, p.materials_rules.omit_on_parceria_entrega);
}

    Object.entries(pm).forEach(([m, baseQty]) => {
    mats[m] = (mats[m] || 0) + (Number(baseQty) || 0) * qty;
});

    lines.push(`${qty} × ${name} = ${fmtMoney(lineTotal)}`);
  });

  const sujo = total * SUJO_FACTOR;
  const res = document.getElementById('resultado');
  const header = `${buyer || '—'} (${faction || '—'})`;
  const linesHtml = lines.length ? lines.map(l => `<div>• ${l}</div>`).join('') : '<div class="small">Nenhum item selecionado.</div>';
  res.innerHTML = `
    <p><strong>${header}</strong></p>
    ${linesHtml}
    <p><strong>
      Total ${fmtMoney(total)} | 
      Valor sujo ${fmtMoney(sujo)} | 
      Peso ${totalWeight.toFixed(2)} kg
    </strong></p>
  `;

  const ul = document.getElementById('materiais');
  ul.innerHTML = '';
  Object.keys(mats).sort().forEach(m => {
    const li = document.createElement('li');
    li.textContent = `${m}: ${mats[m]}`;
    ul.appendChild(li);
  });
}

function limpar(){
  document.querySelectorAll('.qtd').forEach(inp => inp.value = 0);
  document.getElementById('comprador').value = '';
  document.getElementById('faccao').value = '';
  document.getElementById('tipo').value = 'normal';
  document.getElementById('resultado').innerHTML = '<p class="small">Preencha as quantidades e clique em <strong>Calcular</strong>.</p>';
  document.getElementById('materiais').innerHTML = '';
}

document.getElementById('calcular').addEventListener('click', calcular);
document.getElementById('limpar').addEventListener('click', limpar);
loadCatalog();
