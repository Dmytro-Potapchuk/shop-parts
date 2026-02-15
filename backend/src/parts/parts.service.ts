// Plik: backend/src/parts/parts.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; // Importuj Like
import { Part } from './parts.entity';
import { CreatePartDto } from './dto/create-part.dto'; // Załóżmy, że to DTO już istnieje
import { UpdatePartDto } from './dto/update-part.dto'; // Załóżmy, że to DTO już istnieje
import { PaginatedPartsResponse, PartsQueryDto } from './dto/parts-query.dto'; // Importuj nowe DTO i interfejs

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private partsRepository: Repository<Part>,
  ) {}

  async findAll(queryDto: PartsQueryDto): Promise<PaginatedPartsResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.partsRepository.createQueryBuilder('part');

    if (search) {
      // Proste wyszukiwanie w nazwie LUB opisie
      // Dla MySQL LIKE jest często case-insensitive domyślnie (zależne od kolacji)
      // Dla PostgreSQL można użyć ILIKE
      queryBuilder.where(
        'part.name LIKE :search OR part.description LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    // Sortowanie
    // Upewnij się, że sortBy jest bezpieczne i odnosi się do rzeczywistej kolumny
    const allowedSortByFields = ['name', 'price', 'stock'];
    if (allowedSortByFields.includes(sortBy)) {
      queryBuilder.orderBy(
        `part.${sortBy}`,
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      queryBuilder.orderBy('part.name', 'ASC'); // Domyślne sortowanie, jeśli sortBy jest nieprawidłowe
    }

    queryBuilder.skip(skip).take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      totalItems,
      totalPages,
      currentPage: Number(page), // Upewnij się, że page jest liczbą
      itemsPerPage: Number(limit), // Upewnij się, że limit jest liczbą
    };
  }

  async findOne(id: number): Promise<Part> {
    // ... (bez zmian) ...
    const part = await this.partsRepository.findOne({ where: { id } });
    if (!part) {
      throw new NotFoundException(`Część o ID ${id} nie została znaleziona.`);
    }
    return part;
  }

  async create(createPartDto: CreatePartDto): Promise<Part> {
    // Używaj DTO
    // ... (bez zmian, ale używaj createPartDto) ...
    const newPart = this.partsRepository.create(createPartDto);
    return this.partsRepository.save(newPart);
  }

  async update(id: number, updatePartDto: UpdatePartDto): Promise<Part> {
    // Używaj DTO
    // ... (bez zmian, ale używaj updatePartDto) ...
    // Najpierw sprawdź, czy część istnieje
    const partToUpdate = await this.findOne(id);
    if (!partToUpdate) {
      throw new NotFoundException(
        `Część o ID ${id} nie została znaleziona do aktualizacji.`,
      );
    }
    await this.partsRepository.update(id, updatePartDto);
    return this.findOne(id); // Zwróć zaktualizowaną część
  }

  async delete(id: number): Promise<void> {
    // ... (bez zmian) ...
    const result = await this.partsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Część o ID ${id} nie została znaleziona do usunięcia.`,
      );
    }
  }

  async purchase(id: number, quantity: number): Promise<Part> {
    // ... (bez zmian) ...
    const part = await this.findOne(id);
    if (part.stock < quantity) {
      throw new BadRequestException('Niewystarczająca ilość na stanie');
    }
    part.stock -= quantity;
    return this.partsRepository.save(part);
  }
}
