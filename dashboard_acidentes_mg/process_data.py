#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Principal de Processamento de Dados
Executa todos os processadores para gerar arquivos JSON
"""

import sys
import os
from pathlib import Path

# Adicionar diretório de processadores ao path
sys.path.insert(0, str(Path(__file__).parent / 'processors'))

from kpis_processor import process_kpis
from evolucao_processor import process_evolucao_mensal
from causas_processor import process_causas
from distribuicoes_processor import process_distribuicoes
from rankings_processor import process_rankings
from areas_criticas_processor import process_areas_criticas


def print_header():
    """Imprime cabeçalho do script"""
    print("""
╭───────────────────────────────────────────────────────╮
│                                                       │
│   🚗 DASHBOARD ACIDENTES MG - Processador de Dados  │
│                                                       │
╰───────────────────────────────────────────────────────╯
    """)


def print_separator():
    """Imprime separador visual"""
    print("\n" + "─" * 60 + "\n")


def main():
    """
    Função principal que executa todos os processadores
    """
    print_header()
    
    print("▶️  Iniciando processamento de dados...\n")
    
    try:
        # 1. Processar KPIs
        process_kpis()
        
        # 2. Processar evolução mensal
        process_evolucao_mensal()
        
        # 3. Processar causas
        process_causas()
        
        # 4. Processar distribuições
        process_distribuicoes()
        
        # 5. Processar rankings
        process_rankings()
        
        # 6. Processar áreas críticas
        process_areas_criticas()
        
        print_separator()
        print("✅ Processamento concluído com sucesso!\n")
        print("📁 Arquivos JSON gerados em: /home/ubuntu/dashboard_acidentes_mg/data/")
        print("\nArquivos criados:")
        print("  • kpis.json")
        print("  • evolucao_mensal.json")
        print("  • causas.json")
        print("  • distribuicoes.json")
        print("  • rankings.json")
        print("  • areas_criticas.json")
        print_separator()
        
    except Exception as e:
        print_separator()
        print(f"❌ Erro durante o processamento: {str(e)}")
        print("\nDetalhes do erro:")
        import traceback
        traceback.print_exc()
        print_separator()
        sys.exit(1)


if __name__ == "__main__":
    main()
