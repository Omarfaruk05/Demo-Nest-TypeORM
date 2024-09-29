import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProvider } from '../auth/providers/hashing.provider';
import { MailService } from '../mail/mail.service';
import { PaginationProvider } from 'src/app/common/pagination/pagination.provider';
import { IPagination } from 'src/app/common/pagination/pagination.interface';
import { GetUsersDto } from './dto/get-users.dto';

@Injectable()
export class UsersService {
  constructor(
    /**
     * Inject User Repository
     */

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    /**
     * Inject hashingProvider
     */
    private readonly hashingProvider: HashingProvider,

    /**
     * Inject mailService
     */
    private readonly mailService: MailService,

    /**
     * Inject paginationProvider
     */
    private readonly paginationProvider: PaginationProvider,
  ) {}

  // Functions for controller
  // create a user
  public async create(createUserDto: CreateUserDto) {
    let existUser = undefined;
    try {
      existUser = await this.usersRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Error connecting to the database',
      });
    }

    // handle exceptions
    if (existUser) {
      throw new BadRequestException(
        'The user is already exist, please check your email.',
      );
    }

    // create a new user instance
    let newUser = this.usersRepository.create({
      ...createUserDto,
      password: await this.hashingProvider.hashPassword(
        createUserDto?.password,
      ),
    });

    try {
      newUser = await this.usersRepository.save(newUser);
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Error connecting to the database.',
      });
    }

    try {
      await this.mailService.sendOtp(newUser);
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'The error from mail send.',
      });
    }
    return newUser;
  }

  // find all user
  public async findAll(usersQuery: GetUsersDto): Promise<IPagination<User>> {
    const searchableFields = ['name', 'role'];
    const { page, limit, search, ...filters } = usersQuery;

    const users = this.paginationProvider.paginateQuery(
      {
        limit,
        page,
        search,
        filters,
      },
      searchableFields,
      this.usersRepository,
    );

    return users;
  }

  // Find single user by ID
  public async findOne(id: number) {
    let user: User | undefined = undefined;

    try {
      // this return null is user does not exist
      user = await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not fetch the user',
      });
    }

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    return user;
  }
  // Find single user by email
  public async findOneNyEmail(email: string) {
    let user: User | undefined = undefined;

    try {
      // this return null is user does not exist
      user = await this.usersRepository.findOneBy({
        email,
      });
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not fetch the user',
      });
    }

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    return user;
  }

  // Update single user
  public async update(id: number, updateUserDto: UpdateUserDto) {
    let existUser = undefined;
    try {
      existUser = await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Error connecting to the database',
      });
    }

    // handle exceptions
    if (!existUser) {
      throw new BadRequestException('Can not find the user for the ID');
    }

    // Set updated data
    existUser.name = updateUserDto.name;

    //Save updated data to database
    return await this.usersRepository.save(existUser);
  }

  // Delete single user
  public async remove(id: number) {
    return await this.usersRepository.delete(id);
  }
}
