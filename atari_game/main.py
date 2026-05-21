import pygame
import sys
import random

# Inicializacao do Pygame
pygame.init()

# Configuracoes da tela
LARGURA = 800
ALTURA = 600
TELA = pygame.display.set_mode((LARGURA, ALTURA))
pygame.display.set_caption("Pong - Estilo Atari")

# Cores
BRANCO = (255, 255, 255)
PRETO = (0, 0, 0)

# Configuracoes de fonte
FONTE = pygame.font.Font(None, 74)

class Raquete(pygame.Rect):
    def __init__(self, x, y, largura, altura, velocidade):
        super().__init__(x, y, largura, altura)
        self.velocidade = velocidade

    def mover_jogador(self, teclas):
        if teclas[pygame.K_UP] and self.top > 0:
            self.y -= self.velocidade
        if teclas[pygame.K_DOWN] and self.bottom < ALTURA:
            self.y += self.velocidade

    def mover_cpu(self, bola):
        # Atraso para tornar a CPU possivel de ser vencida
        if self.centery < bola.centery and self.bottom < ALTURA:
            self.y += self.velocidade
        if self.centery > bola.centery and self.top > 0:
            self.y -= self.velocidade

class Bola(pygame.Rect):
    def __init__(self, x, y, tamanho, velocidade_x, velocidade_y):
        super().__init__(x, y, tamanho, tamanho)
        self.velocidade_x = velocidade_x
        self.velocidade_y = velocidade_y

    def mover(self):
        self.x += self.velocidade_x
        self.y += self.velocidade_y

    def inverter_x(self):
        self.velocidade_x *= -1

    def inverter_y(self):
        self.velocidade_y *= -1

def resetar_bola(bola):
    bola.center = (LARGURA // 2, ALTURA // 2)
    bola.velocidade_x *= random.choice((1, -1))
    bola.velocidade_y *= random.choice((1, -1))

def desenhar_tela(tela, jogador, cpu, bola, pontos_jogador, pontos_cpu):
    tela.fill(PRETO)
    
    # Desenhar raquetes e bola
    pygame.draw.rect(tela, BRANCO, jogador)
    pygame.draw.rect(tela, BRANCO, cpu)
    pygame.draw.ellipse(tela, BRANCO, bola)
    
    # Desenhar linha central tracejada para o visual classico
    for i in range(0, ALTURA, 30):
        pygame.draw.rect(tela, BRANCO, (LARGURA // 2 - 2, i, 4, 15))
    
    # Desenhar pontuacao
    texto_jogador = FONTE.render(str(pontos_jogador), True, BRANCO)
    texto_cpu = FONTE.render(str(pontos_cpu), True, BRANCO)
    tela.blit(texto_jogador, (LARGURA // 4, 20))
    tela.blit(texto_cpu, (LARGURA * 3 // 4, 20))
    
    pygame.display.flip()

def main():
    relogio = pygame.time.Clock()
    
    # Instanciando objetos
    jogador = Raquete(50, ALTURA // 2 - 50, 15, 100, 7)
    cpu = Raquete(LARGURA - 65, ALTURA // 2 - 50, 15, 100, 6)
    
    # Aumentando a velocidade da bola inicial para deixar mais fluido
    velocidade_inicial_x = 6 * random.choice((1, -1))
    velocidade_inicial_y = 6 * random.choice((1, -1))
    bola = Bola(LARGURA // 2 - 15, ALTURA // 2 - 15, 20, velocidade_inicial_x, velocidade_inicial_y)
    
    pontos_jogador = 0
    pontos_cpu = 0
    
    rodando = True
    while rodando:
        for evento in pygame.event.get():
            if evento.type == pygame.QUIT:
                rodando = False

        # Entradas do jogador
        teclas = pygame.key.get_pressed()
        jogador.mover_jogador(teclas)
        
        # Movimento da CPU
        cpu.mover_cpu(bola)
        
        # Movimento da bola
        bola.mover()
        
        # Colisoes com bordas superior e inferior
        if bola.top <= 0 or bola.bottom >= ALTURA:
            bola.inverter_y()
            
        # Colisoes com as raquetes
        # Usando inflate para melhorar um pouco a caixa de colisao na borda
        if bola.colliderect(jogador) and bola.velocidade_x < 0:
            bola.inverter_x()
            # Pequeno ajuste de aceleracao da bola ou correcao na borda
            bola.left = jogador.right
            
        if bola.colliderect(cpu) and bola.velocidade_x > 0:
            bola.inverter_x()
            bola.right = cpu.left
            
        # Pontuacao
        if bola.left <= 0:
            pontos_cpu += 1
            resetar_bola(bola)
        if bola.right >= LARGURA:
            pontos_jogador += 1
            resetar_bola(bola)
            
        # Atualizar tela
        desenhar_tela(TELA, jogador, cpu, bola, pontos_jogador, pontos_cpu)
        
        # Controlar FPS
        relogio.tick(60)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
