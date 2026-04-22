# Explicação dos Erros em `debug.py`

## Erros de sintaxe
1. `item1 = float(input(Preço do item 1? ))`
   - Falta aspas ao redor da string do prompt. Deve ser `input("Preço do item 1? ")`.

2. `item2 = float(input("Preço do item 2? "))` e `item3 = float(input("Preço do item 3? "))`
   - Esses prompts estão corretos, mas o primeiro caso de `item1` impede a execução do arquivo.

3. `if desconto_cupom > 0:`
   - O bloco `if` não tem indentação no `print` seguinte. Deve ter indentação para o corpo do `if`.

## Erros de tipo / lógica
4. `desconto_cupom = (input("Você tem um cupom de desconto? (Digite o percentual ou 0): "))`
   - O valor de `desconto_cupom` fica como string, e depois é usado em uma operação aritmética.
   - Deve ser convertido para número, por exemplo `float(input(...))`.

5. `desconto = subtotal * (desconto_cupom / 100)`
   - Se `desconto_cupom` continuar string, isso causa `TypeError`.

6. `if desconto_cupom > 0:`
   - Mesmo que convertido para número, convém usar `desconto_cupom_float` ou nome similar para deixar claro que é valor numérico.

## Erros na exibição de strings formatadas
7. `print(" Item 2:        R$ {total_item2:.2f}")`
   - Esta linha não usa f-string, portanto o placeholder ` {total_item2:.2f}` será exibido literalmente.
   - Deve ser `print(f" Item 2:        R$ {total_item2:.2f}")`.

8. O código imprime `total_item1`, `total_item2`, `total_item3`, `subtotal`, `imposto` e `total`, mas o desconto só é mostrado se o `if` estiver corretamente indentado e o valor for numérico.

## Resumo
- O maior erro de sintaxe está no prompt de `item1` sem aspas.
- Há um erro de formatação em `Item 2` que impede a interpolação correta.
- O bloco `if desconto_cupom > 0:` precisa de indentação para funcionar.
- `desconto_cupom` deve ser convertido para `float` antes de usar em cálculos.

Esses são os principais pontos a corrigir em `debug.py`.