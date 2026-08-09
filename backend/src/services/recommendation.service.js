const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RecommendationService {
  // Calculate skill match score between two users
  calculateSkillMatch(userSkills, targetSkills) {
    if (!userSkills || userSkills.length === 0 || !targetSkills || targetSkills.length === 0) {
      return 0;
    }

    // Get skill IDs
    const userSkillIds = userSkills.map(us => us.skillId);
    const targetSkillIds = targetSkills.map(ts => ts.skillId);

    // Find common skills
    const commonSkills = userSkillIds.filter(id => targetSkillIds.includes(id));
    
    if (commonSkills.length === 0) {
      return 0;
    }

    // Calculate score based on number of common skills
    // Max score 100 if all skills match
    const maxSkills = Math.max(userSkillIds.length, targetSkillIds.length);
    const matchPercentage = (commonSkills.length / maxSkills) * 100;

    return Math.round(matchPercentage);
  }

  // Calculate location proximity score
  calculateProximity(user1, user2) {
    if (!user1.county || !user2.county) {
      return 0;
    }

    // Simple proximity based on county match
    if (user1.county === user2.county) {
      // Same county = high score
      if (user1.subCounty && user2.subCounty && user1.subCounty === user2.subCounty) {
        return 100; // Same sub-county
      }
      return 70; // Same county, different sub-county
    }

    // Different counties - check if they're neighboring (simplified)
    return 30;
  }

  // Calculate experience match score
  calculateExperienceMatch(user1, user2) {
    if (!user1.skills || !user2.skills) {
      return 0;
    }

    let totalScore = 0;
    let matches = 0;

    for (const skill1 of user1.skills) {
      for (const skill2 of user2.skills) {
        if (skill1.skillId === skill2.skillId) {
          // Same skill - compare experience levels
          const exp1 = skill1.yearsExperience || 0;
          const exp2 = skill2.yearsExperience || 0;
          
          if (exp1 === 0 && exp2 === 0) {
            totalScore += 50;
          } else {
            const diff = Math.abs(exp1 - exp2);
            if (diff <= 1) {
              totalScore += 100;
            } else if (diff <= 3) {
              totalScore += 70;
            } else if (diff <= 5) {
              totalScore += 40;
            } else {
              totalScore += 20;
            }
          }
          matches++;
        }
      }
    }

    if (matches === 0) {
      return 0;
    }

    return Math.round(totalScore / matches);
  }

  // Calculate mentor compatibility
  calculateMentorCompatibility(user1, user2) {
    // If one is a mentor and the other wants mentoring
    if (user1.isMentor && user2.isLookingForMentor) {
      return 100;
    }
    if (user2.isMentor && user1.isLookingForMentor) {
      return 100;
    }
    if (user1.isMentor && user2.isMentor) {
      return 50; // Both mentors - can collaborate
    }
    return 0;
  }

  // Calculate volunteer compatibility
  calculateVolunteerCompatibility(user1, user2) {
    if (user1.isVolunteer && user2.isVolunteer) {
      return 100; // Both volunteers
    }
    return 0;
  }

  // Generate comprehensive recommendation score
  async generateRecommendationScore(user1, user2) {
    // Get full user data with skills
    const fullUser1 = await prisma.user.findUnique({
      where: { id: user1.id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    const fullUser2 = await prisma.user.findUnique({
      where: { id: user2.id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!fullUser1 || !fullUser2) {
      return 0;
    }

    // Calculate individual scores
    const skillScore = this.calculateSkillMatch(fullUser1.skills, fullUser2.skills);
    const proximityScore = this.calculateProximity(fullUser1, fullUser2);
    const experienceScore = this.calculateExperienceMatch(fullUser1, fullUser2);
    const mentorScore = this.calculateMentorCompatibility(fullUser1, fullUser2);
    const volunteerScore = this.calculateVolunteerCompatibility(fullUser1, fullUser2);

    // Weighted combination
    // Weights: Skill 40%, Proximity 25%, Experience 15%, Mentor 10%, Volunteer 10%
    const totalScore = 
      (skillScore * 0.40) +
      (proximityScore * 0.25) +
      (experienceScore * 0.15) +
      (mentorScore * 0.10) +
      (volunteerScore * 0.10);

    return {
      total: Math.round(totalScore),
      breakdown: {
        skill: skillScore,
        proximity: proximityScore,
        experience: experienceScore,
        mentor: mentorScore,
        volunteer: volunteerScore,
      },
    };
  }

  // Get recommendations for a user
  async getRecommendations(userId, limit = 10, filters = {}) {
    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: true,
      },
    });

    if (!user) {
      return [];
    }

    // Build query filters
    const where = {
      id: { not: userId },
      isActive: true,
    };

    // Apply filters
    if (filters.isMentor === true) {
      where.isMentor = true;
    }

    if (filters.isVolunteer === true) {
      where.isVolunteer = true;
    }

    if (filters.county) {
      where.county = filters.county;
    }

    // Get potential candidates
    const candidates = await prisma.user.findMany({
      where,
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      take: 50, // Get more than needed for better scoring
    });

    // Score each candidate
    const scoredCandidates = [];
    for (const candidate of candidates) {
      const score = await this.generateRecommendationScore(user, candidate);
      
      // Only include if score > 0
      if (score.total > 0) {
        scoredCandidates.push({
          user: candidate,
          score: score.total,
          breakdown: score.breakdown,
        });
      }
    }

    // Sort by score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Return top results
    return scoredCandidates.slice(0, limit);
  }

  // Get mentor recommendations for a user
  async getMentorRecommendations(userId, limit = 10) {
    return await this.getRecommendations(userId, limit, { isMentor: true });
  }

  // Get volunteer recommendations for a user
  async getVolunteerRecommendations(userId, limit = 10) {
    return await this.getRecommendations(userId, limit, { isVolunteer: true });
  }

  // Get nearby recommendations
  async getNearbyRecommendations(userId, limit = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.county) {
      return await this.getRecommendations(userId, limit);
    }

    return await this.getRecommendations(userId, limit, { county: user.county });
  }
}

module.exports = new RecommendationService();