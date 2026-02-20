# Dashboard Acidentes MG - Processador de Dados

## 📝 Descrição

Este projeto contém scripts Python para processar dados de acidentes de trânsito em Minas Gerais e gerar arquivos JSON estruturados para consumo em um dashboard NextJS.

## 📁 Estrutura do Projeto

```
dashboard_acidentes_mg/
├── data/                    # Arquivos JSON gerados
│   ├── kpis.json
│   ├── evolucao_mensal.json
│   ├── causas.json
│   ├── distribuicoes.json
│   ├── rankings.json
│   └── areas_criticas.json
├── processors/              # Scripts de processamento
│   ├── utils.py
│   ├── kpis_processor.py
│   ├── evolucao_processor.py
│   ├── causas_processor.py
│   ├── distribuicoes_processor.py
│   ├── rankings_processor.py
│   └── areas_criticas_processor.py
├── process_data.py          # Script principal
└── README.md
```

## 👾 Arquivos de Entrada

Os scripts esperam encontrar dois arquivos CSV em `/home/ubuntu/Uploads/`:

1. **acidentes_mg_dashboard_master.csv** - Dados históricos de acidentes
2. **previsao_acidentes_2026.csv** - Previsões de acidentes para 2026

## 🚀 Como Usar

### Executar Processamento Completo

```bash
cd /home/ubuntu/dashboard_acidentes_mg
python3 process_data.py
```

Este comando irá executar todos os processadores e gerar todos os arquivos JSON.

### Executar Processadores Individuais

Você também pode executar processadores específicos:

```bash
cd /home/ubuntu/dashboard_acidentes_mg/processors

# KPIs
python3 kpis_processor.py

# Evolução mensal
python3 evolucao_processor.py

# Causas de acidentes
python3 causas_processor.py

# Distribuições
python3 distribuicoes_processor.py

# Rankings
python3 rankings_processor.py

# Áreas críticas
python3 areas_criticas_processor.py
```

## 📄 Arquivos JSON Gerados

### 1. kpis.json

Contém KPIs principais com valores e tendências:
- Total de Acidentes
- Total de Mortos
- Total de Feridos
- Taxa de Mortalidade (%)
- Índice de Gravidade

Cada KPI inclui:
- Valor atual
- Tendência vs mês anterior (percentual e tipo)
- Formato de exibição

### 2. evolucao_mensal.json

Série temporal com agregação mensal:
- Total de acidentes por mês
- Total de mortos por mês
- Total de feridos por mês

### 3. causas.json

Top 10 causas de acidentes:
- Nome da causa
- Total de acidentes
- Total de mortos
- Total de feridos
- Percentual do total

### 4. distribuicoes.json

Distribuições por:
- Tipo de acidente
- Fase do dia
- Condição meteorológica

Cada distribuição inclui totais e percentuais.

### 5. rankings.json

Rankings:
- Top 10 municípios por número de acidentes
- Top 10 BRs por número de acidentes

Cada entrada inclui posição, totais de acidentes, mortos e feridos.

### 6. areas_criticas.json

Áreas de maior risco:
- Municípios com maior índice de gravidade (mínimo 5 acidentes)
- BRs com maior taxa de mortalidade (mínimo 10 acidentes)

## 📊 Cálculos Especiais

### Índice de Gravidade

Fórmula ponderada que considera a severidade das vítimas:

```
Índice = (mortos × 5 + feridos_graves × 3 + feridos_leves × 1) / total_vítimas
```

Resultado: valor entre 0 e 5, onde valores mais altos indicam maior gravidade.

### Taxa de Mortalidade

```
Taxa = (total_mortos / (total_mortos + total_feridos)) × 100
```

Resultado: percentual de mortos em relação ao total de vítimas.

## 🐛 Dependências

- Python 3.6+
- pandas
- numpy

Instalação:

```bash
pip install pandas numpy
```

## ⚙️ Configurações

Os caminhos dos arquivos estão codificados em `processors/utils.py`:

- **Arquivos de entrada**: `/home/ubuntu/Uploads/`
- **Arquivos de saída**: `/home/ubuntu/dashboard_acidentes_mg/data/`

Para alterar esses caminhos, edite o arquivo `utils.py`.

## 📝 Notas

- Os dados são processados usando a coluna `id` para contar acidentes únicos (evitando duplicação devido a múltiplos veículos/pessoas envolvidos)
- Valores nulos e strings vazias são removidos durante o processamento
- Todos os JSONs incluem metadados com timestamp de última atualização
- Os arquivos JSON usam encoding UTF-8 com acentos preservados

## 🔄 Regenerar Dados

Para regenerar todos os JSONs após atualização dos CSVs:

```bash
python3 process_data.py
```

Os arquivos JSON existentes serão substituídos automaticamente.
