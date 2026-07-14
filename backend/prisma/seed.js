const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const defaultCategories = [
  {
    name: "Alimentação",
    description: "Refeições, mercado, lanches e alimentação no campus."
  },
  {
    name: "Transporte",
    description: "Ônibus, aplicativo, combustível e deslocamento para o campus."
  },
  {
    name: "Moradia e contas",
    description: "Aluguel, energia, água, internet e despesas domésticas."
  },
  {
    name: "Estudos",
    description: "Livros, materiais, cursos e apoio acadêmico."
  },
  {
    name: "Saúde",
    description: "Medicamentos, consultas e cuidados pessoais."
  },
  {
    name: "Lazer",
    description: "Passeios, eventos, streaming e entretenimento."
  },
  {
    name: "Assinaturas",
    description: "Planos digitais, softwares e serviços recorrentes."
  },
  {
    name: "Compras",
    description: "Roupas, eletrônicos e compras diversas."
  },
  {
    name: "Despesas acadêmicas",
    description: "Xerox, inscrições, materiais e eventos acadêmicos."
  },
  {
    name: "Outros",
    description: "Gastos que não se encaixam nas demais categorias."
  }
];

async function main() {
  for (const category of defaultCategories) {
    const exists = await prisma.category.findFirst({
      where: {
        userId: null,
        name: category.name,
        isDefault: true
      }
    });

    if (!exists) {
      await prisma.category.create({
        data: {
          ...category,
          isDefault: true
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
