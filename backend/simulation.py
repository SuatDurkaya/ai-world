from database import save_human, load_all_humans, init_db, save_conversation
from models import Human
import random
from ai_brain import get_thought 

class SimulationEngine:
    def __init__(self):
        self.humans = []
        self.tick = 0

    def start(self):
        init_db()
        self.humans = load_all_humans()

        if not self.humans:
            for i in range(6):
                human = Human.create_random(i + 1)
                self.humans.append(human)
                save_human(human)
            print("6 human created.")
        else:
            print(f"{len(self.humans)} human uploaded.")

    async def run_tick(self):
        self.tick += 1
        alive = [h for h in self.humans if h.alive]
        for human in self.humans:
            human.age += 1

            human.health += random.randint(-5,3)
            human.energy += random.randint(-8,5)

            human.x += random.uniform(-2, 2)
            human.y += random.uniform(-2, 2)

            # max 100 min 0
            human.health = max(0, min(100, human.health))
            human.energy = max(0, min(100, human.energy))

            human.x = max(0, min(100, human.x))
            human.y = max(0, min(100, human.y))

            if human.health <= 0:
                human.alive = False
                print(f"{human.name} died at age {human.age}")
            elif human.age >= 65:
                if random.random() < 0.3:  # %30 ihtimalle ölür
                    human.alive = False
                    print(f"{human.name} died of old age at {human.age}")

            save_human(human)
        

        # AI düşünceleri — 2 sakin seç
        if len(alive) >= 2:
            targets = random.sample(alive, 2)
            a1, a2 = targets[0], targets[1]

            a1.last_thought = await get_thought(a1, other=a2)
            a2.last_thought = await get_thought(a2, other=a1)
            
            save_conversation(self.tick, a1.id, a2.id, a1.last_thought)
            save_conversation(self.tick, a2.id, a1.id, a2.last_thought)
            
            save_human(a1)
            save_human(a2)

        if random.random() < 0.15:
            new_id = len(self.humans) + 1
            new_born = Human.create_random(new_id)
            self.humans.append(new_born)
            save_human(new_born)
            print(f"{new_born.name} was born!")