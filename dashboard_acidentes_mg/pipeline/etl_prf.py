import os
import pandas as pd
import zipfile
import subprocess

# Configurações de pastas
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DADOS_DIR = os.path.join(BASE_DIR, 'dados_historicos')
ARQUIVO_FINAL = os.path.join(DADOS_DIR, 'acidentes_master.parquet')

# URLs oficiais dos Dados Abertos da PRF
URLS_PRF = {
    "2023": "https://arquivos.prf.gov.br/arquivos/index.php/s/kRBUylqz6DyQznN/download",
    "2024": "https://arquivos.prf.gov.br/arquivos/index.php/s/yxeXfVNnyZ2RROp/download"
}

def baixar_e_extrair_dados():
    dataframes = []
    
    for ano, url in URLS_PRF.items():
        print(f"📥 Baixando dados do ano {ano}...")
        zip_path = os.path.join(DADOS_DIR, f"dados_{ano}.zip")
        
        try:
            # Usando o curl nativo do Windows para burlar o bloqueio SSL do Python
            comando_curl = [
                "curl", "-k", "-L", 
                "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "-o", zip_path, url
            ]
            
            # Executa o download (pode demorar um pouco, aguarde)
            subprocess.run(comando_curl, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            # Extrai e lê o CSV
            with zipfile.ZipFile(zip_path) as z:
                csv_filename = [name for name in z.namelist() if name.endswith('.csv')][0]
                print(f"📄 Extraindo {csv_filename}...")
                
                with z.open(csv_filename) as f:
                    df = pd.read_csv(f, sep=';', encoding='latin1', on_bad_lines='skip')
                    dataframes.append(df)
                    print(f"✅ {ano} carregado: {len(df)} linhas.")
            
            # Limpa o arquivo zip temporário
            os.remove(zip_path)

        except Exception as e:
            print(f"❌ Erro ao processar {ano}: {e}")
            if os.path.exists(zip_path):
                os.remove(zip_path)

    if not dataframes:
        print("⚠️ Nenhum dado foi baixado. Abortando.")
        return None

    df_master = pd.concat(dataframes, ignore_index=True)
    return df_master

def limpar_e_padronizar(df):
    print("🧹 Iniciando limpeza e padronização dos dados...")
    
    col_map = {
        'data_inversa': 'data_inversa', 'condicao_metereologica': 'condicao_met',
        'tipo_acidente': 'tipo_acidente', 'mortos': 'mortos', 'feridos_leves': 'feridos_leves',
        'feridos_graves': 'feridos_graves', 'fase_dia': 'fase_dia', 'causa_acidente': 'causa', 
        'municipio': 'municipio', 'br': 'br'
    }
    
    col_map_real = {k: v for k, v in col_map.items() if k in df.columns}
    df = df.rename(columns=col_map_real)
    
    if 'feridos' not in df.columns:
        leves = pd.to_numeric(df.get('feridos_leves', 0), errors='coerce').fillna(0)
        graves = pd.to_numeric(df.get('feridos_graves', 0), errors='coerce').fillna(0)
        df['feridos'] = leves + graves

    df['mortos'] = pd.to_numeric(df.get('mortos', 0), errors='coerce').fillna(0)
    df['data_inversa'] = pd.to_datetime(df['data_inversa'], errors='coerce')
    
    df['ano'] = df['data_inversa'].dt.year.astype('Int64').astype(str).replace('<NA>', '')
    df['mes_num'] = df['data_inversa'].dt.month.astype('Int64')
    
    linhas_antes = len(df)
    df = df.drop_duplicates()
    linhas_depois = len(df)
    print(f"✂️ Linhas duplicadas removidas: {linhas_antes - linhas_depois}")

    return df

if __name__ == "__main__":
    print("🚀 Iniciando Pipeline ETL da PRF via CURL...")
    
    df_bruto = baixar_e_extrair_dados()
    
    if df_bruto is not None:
        df_limpo = limpar_e_padronizar(df_bruto)
        print(f"💾 Salvando o banco de dados otimizado em: {ARQUIVO_FINAL}")
        df_limpo.to_parquet(ARQUIVO_FINAL, index=False)
        print(f"🎉 Pipeline concluído com sucesso! Total de registros salvos: {len(df_limpo)}")
