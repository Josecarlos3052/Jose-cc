import sys

def is_prime(number: int) -> bool:
    """
    Verifica se um número é primo.
    Um número primo é maior que 1 e não tem divisores positivos além de 1 e ele mesmo.

    Args:
        number (int): O número a ser verificado.

    Returns:
        bool: True se primo, False caso contrário.

    Raises:
        ValueError: Se o número não for inteiro.
    """
    if not isinstance(number, int):
        raise ValueError("O número deve ser um inteiro.")

    if number <= 1:
        return False
    if number <= 3:
        return True
    if number % 2 == 0 or number % 3 == 0:
        return False

    divisor_candidate = 5
    while divisor_candidate * divisor_candidate <= number:
        if number % divisor_candidate == 0 or number % (divisor_candidate + 2) == 0:
            return False
        divisor_candidate += 6

    return True

def main():
    """Função principal para exemplo de uso."""
    try:
        num = 29
        if is_prime(num):
            print(f"{num} é um número primo.")
        else:
            print(f"{num} não é um número primo.")
    except ValueError as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    main()