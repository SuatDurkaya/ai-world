import random
from faker import Faker
import json

fake = Faker("en")

JOBS = ["rancher", "trader", "doctor", "explorer", "wizard", "blacksmith"]
PERSONALITIES = ["curious","brave","calm","sly","merciful"]
GENE_POOL = ["intelligence", "power", "empathy", "endurance", "speed", "luck"]

class Human:
    def __init__(self, id, name, personality, job, genes, health=100, energy=100, age=0, alive=True, last_thought="", x=0.0, y=0.0):
        self.id = id
        self.name = name
        self.personality = personality
        self.job = job
        self.genes = genes
        self.health = health
        self.energy = energy
        self.age = age
        self.alive = alive
        self.last_thought = last_thought
        self.x = x
        self.y = y
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "personality": self.personality,
            "job": self.job,
            "genes": self.genes,
            "health": self.health,
            "energy": self.energy,
            "age": self.age,
            "alive": self.alive,
            "last_thought": self.last_thought,
            "x": self.x,
            "y": self.y
        }
    
    @staticmethod
    def create_random(id):
        return Human(
            id=id,
            name = fake.first_name(),
            job = random.choice(JOBS),
            personality = random.choice(PERSONALITIES),
            genes = random.sample(GENE_POOL, 3),
            x = random.uniform(0, 100),
            y = random.uniform(0, 100),
        )