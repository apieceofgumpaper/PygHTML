import asyncio
import pygame


pygame.init()
pygame.display.set_caption("PygHTML: bounce.py")

W, H = 900, 520
screen = pygame.display.set_mode((W, H))
clock = pygame.time.Clock()

x, y = W // 2, H // 2
vx, vy = 2.6, 1.9


async def main():
    global x, y, vx, vy
    running = True
    while running:
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                running = False
            if e.type == pygame.KEYDOWN and e.key == pygame.K_ESCAPE:
                running = False

        x += vx
        y += vy
        if x < 12 or x > W - 12:
            vx = -vx
        if y < 12 or y > H - 12:
            vy = -vy

        screen.fill((11, 14, 20))
        pygame.draw.rect(screen, (98, 214, 255), (18, 18, W - 36, H - 36), 2)
        pygame.draw.circle(screen, (255, 223, 96), (int(x), int(y)), 12)

        pygame.display.flip()
        clock.tick(60)
        await asyncio.sleep(0)

    pygame.quit()


asyncio.run(main())

