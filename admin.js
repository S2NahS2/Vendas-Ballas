let data = {};

function render(){
  const wrap = document.getElementById('list');
  wrap.innerHTML = '';
  Object.entries(data).forEach(([name, p]) => {
    const card = document.createElement('div');
    card.className = 'item';
    card.innerHTML = `
      <h4>${name}</h4>
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(180px,1fr));">
        <div class="field"><label>Categoria</label><input data-k="category" type="text" value="${p.category ?? ''}" placeholder="Ex: Pistola"></div>
        <div class="field"><label>Preço normal (USD)</label><input data-k="prices.normal" type="number" step="0.01" value="${p.prices?.normal ?? ''}"></div>
        <div class="field"><label>Preço entrega (USD)</label><input data-k="prices.entrega" type="number" step="0.01" value="${p.prices?.entrega ?? ''}"></div>
        <div class="field"><label>Preço parceria (USD)</label><input data-k="prices.parceria" type="number" step="0.01" value="${p.prices?.parceria ?? ''}"></div>
        <div class="field"><label>Peso (kg)</label><input data-k="weight" type="number" step="0.01" value="${p.weight ?? ''}"></div>
      </div>

      <div class="materials">
        <strong>Materiais por unidade</strong>
        <div class="matList"></div>
        <button class="btn small" data-act="addMat">Adicionar material</button>
      </div>

      <div class="controls">
        <button class="btn outline" data-act="rename">Renomear</button>
        <button class="btn outline" data-act="del">Excluir</button>
      </div>
    `;

    const matList = card.querySelector('.matList');
    Object.entries(p.materials || {}).forEach(([m, q]) => {
      const row = document.createElement('div');
      row.className = 'grid';
      row.style.gridTemplateColumns = '2fr 1fr auto';
      row.style.gap = '8px';
      row.style.margin = '6px 0';
      row.innerHTML = `
        <input type="text" value="${m}" data-m="name">
        <input type="number" step="1" value="${q}" data-m="qty">
        <button class="btn small outline" data-act="rmMat">Remover</button>
      `;
      matList.appendChild(row);
    });

    // Inputs gerais
    card.addEventListener('input', (e)=>{
      const k = e.target.getAttribute('data-k');
      if (k){
        if (k.startsWith('prices.')){
          const key = k.split('.')[1];
          data[name].prices = data[name].prices || {};
          data[name].prices[key] = parseFloat(e.target.value || '0');
        } else if (k === 'weight'){
          data[name].weight = parseFloat(e.target.value || '0');
        } else if (k === 'category'){
          data[name].category = e.target.value;
        }
      }
    });

    // Materiais
    card.addEventListener('change', (e)=>{
      if (e.target.getAttribute('data-m')){
        const rows = card.querySelectorAll('.matList > div');
        const mats = {};
        rows.forEach(r => {
          const mn = r.querySelector('[data-m="name"]').value || 'Material';
          const mq = parseFloat(r.querySelector('[data-m="qty"]').value || '0');
          mats[mn] = mq;
        });
        data[name].materials = mats;
      }
    });

    // Botões
    card.addEventListener('click', (e)=>{
      const act = e.target.getAttribute('data-act');
      if (act === 'addMat'){
        data[name].materials = data[name].materials || {};
        data[name].materials['Novo material'] = 0;
        render();
      }
      if (act === 'rmMat'){
        const row = e.target.closest('div.grid');
        const mn = row.querySelector('[data-m="name"]').value;
        delete data[name].materials[mn];
        render();
      }
      if (act === 'del'){
        if (confirm('Excluir produto?')){ delete data[name]; render(); }
      }
      if (act === 'rename'){
        const nn = prompt('Novo nome do produto:', name);
        if (nn && nn !== name){
          data[nn] = data[name];
          delete data[name];
          render();
        }
      }
    });

    wrap.appendChild(card);
  });
}

document.getElementById('load').addEventListener('click', async ()=>{
  const res = await fetch('products.json?v=' + Date.now(), {cache:'no-store'});
  data = await res.json();
  render();
});

document.getElementById('add').addEventListener('click', ()=>{
  const name = prompt('Nome do novo produto:');
  if (!name) return;
  data[name] = { category: 'Geral', prices: { normal: 0 }, weight: 0, materials: {} };
  render();
});

document.getElementById('download').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'products.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  alert('Arquivo baixado. Publique um novo deploy no Netlify para atualizar o público.');
});

document.getElementById('sair').addEventListener('click', ()=>{
  sessionStorage.removeItem('ballas_access');
  window.location.href = 'login.html';
});
