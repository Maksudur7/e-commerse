import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await AuthService.hashPassword(password);

      // Create user
      const user = await UserRepository.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'CUSTOMER',
      });

      // Generate token
      const token = AuthService.generateToken({ userId: user.id, role: user.role });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check password
      const isPasswordValid = await AuthService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = AuthService.generateToken({ userId: user.id, role: user.role });

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
