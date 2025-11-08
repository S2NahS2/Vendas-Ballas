// =================== CONFIGURAÇÃO DE PRODUTOS ===================
const PRODUCTS = {
  "M1911": {
    category: "Pistola",
    prices: {
      normal: 67000.0,
      parceria: 60000.0,
      entrega: 67000.0,
      parceria_entrega: 60000.0
    },
    weight: 2.25,
    materials: {
      "Alumínio": 150,
      "Cobre": 150,
      "Vidro": 175,
      "Corpo de pistola": 1,
      "Plástico": 175,
      "Borracha": 175,
      "Peças de armas": 3
    }
  },

  "Five Seven": {
    category: "Pistola",
    prices: {
      normal: 80000.0,
      entrega: 70000.0,
      parceria: 75000.0,
      parceria_entrega: 65000.0
    },
    weight: 2.75,
    materials: {
      "Alumínio": 180,
      "Cobre": 180,
      "Vidro": 215,
      "Plástico": 215,
      "Borracha": 215,
      "Corpo de pistola": 1,
      "Peças de armas": 3,
      "Engrenagem": 1,
      "Parafusos pequenos": 1,
      "Upgrade pistola": 1
    },
    materials_rules: {
      omit_on_entrega: ["Upgrade pistola"],
      omit_on_parceria_entrega: ["Upgrade pistola"]
    }
  },

  "Munição Pistola (x30)": {
    category: "Munições",
    prices: {
      normal: 15000.0,
      parceria: 14000.0,
      entrega: 15000.0,
      parceria_entrega: 14000.0
    },
    weight: 0.75,
    materials: {
      "Cobre": 15,
      "Frascos de pólvora": 3
    }
  },

  "Munição Sub (x30)": {
    category: "Munições",
    prices: {
      normal: 20000.0,
      parceria: 18000.0,
      entrega: 20000.0,
      parceria_entrega: 18000.0
    },
    weight: 0.75,
    materials: {
      "Alumínio": 15,
      "Cobre": 15,
      "Frascos de pólvora": 5
    }
  },

  "Munição Rifle (x30)": {
    category: "Munições",
    prices: {
      normal: 25000.0,
      parceria: 23000.0,
      entrega: 25000.0,
      parceria_entrega: 23000.0
    },
    weight: 0.75,
    materials: {
      "Alumínio": 30,
      "Cobre": 30,
      "Frascos de pólvora": 8
    }
  }
};

// =================== FUNÇÕES GERAIS ===================
const $ = s => document.querySelector(s);
const fmt = v => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const clone = o => JSON.parse(JSON.stringify(o));

// =================== RENDERIZAÇÃO DINÂMICA ===================
function renderCategorias() {
  const container = $("#categorias");
  const porCategoria = {};

  // agrupar por categoria
  for (const [nome, dados] of Object.entries(PRODUCTS)) {
    if (!porCategoria[dados.category]) porCategoria[dados.category] = [];
    porCategoria[dados.category].push({ nome, dados });
  }

  // construir HTML
  container.innerHTML = Object.entries(porCategoria)
    .map(([cat, itens]) => `
      <div class="categoria">
        <h3 class="categoria-title">• ${cat}</h3>
        <div class="produtos">
          ${itens.map(({ nome }) => `
            <div class="item">
              <h4>${nome}</h4>
              <label class="small">Quantidade</label>
              <input type="number" id="q_${nome.replace(/\\W+/g, '_')}" min="0" value="0">
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
}

// =================== CÁLCULO DO ORÇAMENTO ===================
function calcular() {
  const descontoTipo = ($("#tipo").value || "normal").toLowerCase();
  const upgradeEntregue = $("#upgrade").checked;

  let subtotal = 0, pesoTotal = 0;
  const materiais = {};
  const linhas = [];

  for (const [nome, dados] of Object.entries(PRODUCTS)) {
    const q = parseInt($(`#q_${nome.replace(/\\W+/g, '_')}`)?.value || "0", 10);
    if (q <= 0) continue;

    // selecionar preço com base no desconto
    let preco = dados.prices[descontoTipo] ?? dados.prices.normal;

    // aplicar regra de upgrade
    const materiaisUsados = clone(dados.materials);
    if (upgradeEntregue && dados.materials_rules?.omit_on_entrega?.length) {
      dados.materials_rules.omit_on_entrega.forEach(m => delete materiaisUsados[m]);
      preco -= 10000;
    }

    const totalItem = preco * q;
    subtotal += totalItem;
    pesoTotal += dados.weight * q;

    linhas.push(`• ${q} × ${nome} = ${fmt(preco)} (${fmt(totalItem)})`);

    // somar materiais
    for (const [mat, val] of Object.entries(materiaisUsados)) {
      materiais[mat] = (materiais[mat] || 0) + val * q;
    }
  }

  const total = subtotal;
  const sujo = total * 1.3;

  $("#resultado").innerHTML = `
    ${linhas.join("<br>")}
    <br><strong>Total <span class="text-total">${fmt(total)}</span> | Valor sujo <span class="text-sujo">${fmt(sujo)}</span> | Peso ${pesoTotal.toFixed(2)} kg</strong>
  `;

  $("#materiais").innerHTML = Object.entries(materiais)
    .map(([k, v]) => `${k}: ${v}`)
    .join("<br>");
}

// =================== RESET ===================
function limpar() {
  document.querySelectorAll("input[type='number']").forEach(i => i.value = 0);
  $("#resultado").innerHTML = "<p class='small'>Preencha as quantidades e clique em <strong>Calcular</strong>.</p>";
  $("#materiais").innerHTML = "";
}

// =================== EVENTOS ===================
document.addEventListener("DOMContentLoaded", () => {
  renderCategorias();
  $("#calcular").addEventListener("click", calcular);
  $("#limpar").addEventListener("click", limpar);
});
