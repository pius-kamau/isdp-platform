const skillModel = require('../models/skill.model');

class SkillController {
  // Create a new skill
  async create(req, res) {
    try {
      const { name, description, category, icon } = req.body;

      if (!name) {
        return res.status(400).json({
          status: 'error',
          message: 'Skill name is required',
        });
      }

      // Check if skill already exists
      const existing = await skillModel.findByName(name);
      if (existing) {
        return res.status(400).json({
          status: 'error',
          message: 'Skill already exists',
        });
      }

      const skill = await skillModel.create({
        name,
        description,
        category,
        icon,
      });

      res.status(201).json({
        status: 'success',
        message: 'Skill created successfully',
        data: skill,
      });
    } catch (error) {
      console.error('Create skill error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create skill',
      });
    }
  }

  // Get all skills
  async getAll(req, res) {
    try {
      const skills = await skillModel.findAll();

      // Count users per skill
      const skillsWithCount = skills.map(skill => ({
        ...skill,
        userCount: skill.userSkills.length,
      }));

      res.json({
        status: 'success',
        count: skills.length,
        data: skillsWithCount,
      });
    } catch (error) {
      console.error('Get skills error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch skills',
      });
    }
  }

  // Get skills by category
  async getByCategory(req, res) {
    try {
      const { category } = req.params;
      const skills = await skillModel.findByCategory(category);

      res.json({
        status: 'success',
        count: skills.length,
        data: skills,
      });
    } catch (error) {
      console.error('Get skills by category error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch skills',
      });
    }
  }

  // Get single skill
  async getOne(req, res) {
    try {
      const { id } = req.params;
      const skill = await skillModel.findById(id);

      if (!skill) {
        return res.status(404).json({
          status: 'error',
          message: 'Skill not found',
        });
      }

      res.json({
        status: 'success',
        data: skill,
      });
    } catch (error) {
      console.error('Get skill error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch skill',
      });
    }
  }

  // Update skill
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, category, icon } = req.body;

      const skill = await skillModel.update(id, {
        name,
        description,
        category,
        icon,
      });

      res.json({
        status: 'success',
        message: 'Skill updated successfully',
        data: skill,
      });
    } catch (error) {
      console.error('Update skill error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update skill',
      });
    }
  }

  // Delete skill
  async delete(req, res) {
    try {
      const { id } = req.params;

      await skillModel.delete(id);

      res.json({
        status: 'success',
        message: 'Skill deleted successfully',
      });
    } catch (error) {
      console.error('Delete skill error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete skill',
      });
    }
  }

  // Add skill to user
  async addUserSkill(req, res) {
    try {
      const userId = req.userId;
      const { skillId, proficiencyLevel, yearsExperience, isMentor, isVolunteer } = req.body;

      if (!skillId) {
        return res.status(400).json({
          status: 'error',
          message: 'Skill ID is required',
        });
      }

      // Check if skill exists
      const skill = await skillModel.findById(skillId);
      if (!skill) {
        return res.status(404).json({
          status: 'error',
          message: 'Skill not found',
        });
      }

      // Check if user already has this skill
      const existing = await skillModel.findUserSkill(userId, skillId);
      if (existing) {
        return res.status(400).json({
          status: 'error',
          message: 'User already has this skill',
        });
      }

      const userSkill = await skillModel.addUserSkill({
        userId,
        skillId,
        proficiencyLevel,
        yearsExperience,
        isMentor: isMentor || false,
        isVolunteer: isVolunteer || false,
      });

      res.status(201).json({
        status: 'success',
        message: 'Skill added to user successfully',
        data: userSkill,
      });
    } catch (error) {
      console.error('Add user skill error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to add skill to user',
      });
    }
  }

  // Get user's skills
  async getUserSkills(req, res) {
    try {
      const userId = req.params.userId || req.userId;
      const skills = await skillModel.getUserSkills(userId);

      res.json({
        status: 'success',
        count: skills.length,
        data: skills,
      });
    } catch (error) {
      console.error('Get user skills error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user skills',
      });
    }
  }

  // Update user skill
  async updateUserSkill(req, res) {
    try {
      const { id } = req.params;
      const { proficiencyLevel, yearsExperience, isMentor, isVolunteer } = req.body;

      const userSkill = await skillModel.updateUserSkill(id, {
        proficiencyLevel,
        yearsExperience,
        isMentor,
        isVolunteer,
      });

      res.json({
        status: 'success',
        message: 'User skill updated successfully',
        data: userSkill,
      });
    } catch (error) {
      console.error('Update user skill error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update user skill',
      });
    }
  }

  // Remove user skill
  async removeUserSkill(req, res) {
    try {
      const { id } = req.params;

      await skillModel.removeUserSkill(id);

      res.json({
        status: 'success',
        message: 'Skill removed from user successfully',
      });
    } catch (error) {
      console.error('Remove user skill error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to remove skill from user',
      });
    }
  }
}

module.exports = new SkillController();