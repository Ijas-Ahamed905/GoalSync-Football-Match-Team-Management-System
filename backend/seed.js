import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from './models/User.js';
import Team from './models/Team.js';
import Player from './models/Player.js';
import Coach from './models/Coach.js';
import Match from './models/Match.js';
import Tournament from './models/Tournament.js';
import Training from './models/Training.js';
import News from './models/News.js';

dotenv.config();

const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goalsync';

const seedData = async () => {
  try {
    console.log(`Connecting to database to clear and seed...`);
    await mongoose.connect(connString);

    // Clear database collections
    await User.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Coach.deleteMany({});
    await Match.deleteMany({});
    await Tournament.deleteMany({});
    await Training.deleteMany({});
    await News.deleteMany({});

    console.log('Database cleared. Creating accounts...');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('password123', salt);
    
    const adminUser = await User.create({
      name: 'Executive Admin',
      email: 'admin@goalsync.com',
      password: 'password123', // hooks will trigger hash during normal create, but let's just make it direct
      role: 'Admin',
    });

    const coachUser1 = await User.create({
      name: 'Coach Marcus',
      email: 'coach@goalsync.com',
      password: 'password123',
      role: 'Coach',
    });

    const playerUser1 = await User.create({
      name: 'Ijas Ahamed',
      email: 'player@goalsync.com',
      password: 'password123',
      role: 'Player',
    });

    // 2. Create Coaches Profile
    const coach1 = await Coach.create({
      name: 'Coach Marcus',
      email: 'coach@goalsync.com',
      specialty: 'Tactical',
      experience: 12,
      user: coachUser1._id,
    });

    // 3. Create Teams
    const team1 = await Team.create({
      name: 'GoalSync FC',
      description: 'First team division roster specializing in fast tactical counter plays.',
      coach: coach1._id,
    });

    // Link coach to team
    coach1.team = team1._id;
    await coach1.save();

    // 4. Create Players
    const player1 = await Player.create({
      name: 'Ijas Ahamed',
      email: 'player@goalsync.com',
      user: playerUser1._id,
      position: 'Forward',
      jerseyNumber: 10,
      team: team1._id,
      status: 'Active',
      stats: { goals: 5, assists: 3, yellowCards: 1, redCards: 0, matchesPlayed: 6 }
    });

    const player2 = await Player.create({
      name: 'Suresh Kumar',
      email: 'suresh@goalsync.com',
      position: 'Midfielder',
      jerseyNumber: 8,
      team: team1._id,
      status: 'Active',
      stats: { goals: 2, assists: 6, yellowCards: 2, redCards: 0, matchesPlayed: 6 }
    });

    const player3 = await Player.create({
      name: 'Michael Miller',
      email: 'michael@goalsync.com',
      position: 'Defender',
      jerseyNumber: 4,
      team: team1._id,
      status: 'Active',
      stats: { goals: 0, assists: 1, yellowCards: 0, redCards: 0, matchesPlayed: 5 }
    });

    const player4 = await Player.create({
      name: 'David Silva',
      email: 'david@goalsync.com',
      position: 'Goalkeeper',
      jerseyNumber: 1,
      team: team1._id,
      status: 'Active',
      stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchesPlayed: 6 }
    });

    const player5 = await Player.create({
      name: 'Jerome Boateng',
      email: 'jerome@goalsync.com',
      position: 'Defender',
      jerseyNumber: 5,
      team: team1._id,
      status: 'Injured',
      stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, matchesPlayed: 3 }
    });

    const player6 = await Player.create({
      name: 'Mohamed Salah',
      email: 'salah@goalsync.com',
      position: 'Forward',
      jerseyNumber: 11,
      team: team1._id,
      status: 'Active',
      stats: { goals: 7, assists: 2, yellowCards: 0, redCards: 0, matchesPlayed: 6 }
    });

    // Populate team roster and lineup defaults
    team1.players = [player1._id, player2._id, player3._id, player4._id, player5._id, player6._id];
    team1.captain = player1._id;
    team1.viceCaptain = player2._id;
    team1.lineup = {
      startingXI: [player1._id, player2._id, player3._id, player4._id, player6._id],
      substitutes: [player5._id],
    };
    await team1.save();

    // 5. Create Tournaments
    const tournament1 = await Tournament.create({
      name: 'Champions League Bowl 2026',
      startDate: new Date('2026-08-01T00:00:00.000Z'),
      endDate: new Date('2026-09-30T00:00:00.000Z'),
      teams: [team1._id],
      status: 'Ongoing',
    });

    // 6. Create Matches
    const match1 = await Match.create({
      opponentName: 'Starlight United',
      homeTeam: team1._id,
      awayTeamName: 'Starlight United',
      dateTime: new Date('2026-07-15T18:00:00.000Z'),
      location: 'City Turf Ground A',
      status: 'Completed',
      tournament: tournament1._id,
      score: { home: 3, away: 1 },
      events: [
        { type: 'Goal', minute: 14, player: player1._id, detail: 'Header off a corner' },
        { type: 'Goal', minute: 32, player: player6._id, detail: 'Solo sprint and chip shot' },
        { type: 'Assist', minute: 32, player: player2._id, detail: 'Through pass from midfield' },
        { type: 'YellowCard', minute: 45, player: player2._id, detail: 'Slide tackle from behind' },
        { type: 'Goal', minute: 70, player: player1._id, detail: 'Penalty Kick conversion' },
      ],
    });

    const match2 = await Match.create({
      opponentName: 'Tornado Rangers',
      homeTeam: team1._id,
      awayTeamName: 'Tornado Rangers',
      dateTime: new Date('2026-08-05T19:30:00.000Z'),
      location: 'Main Stadium',
      status: 'Scheduled',
      tournament: tournament1._id,
    });

    // Link matches to tournament
    tournament1.fixtures = [match1._id, match2._id];
    await tournament1.save();

    // 7. Create Training Logs
    const training1 = await Training.create({
      title: 'Fitness & Physical Recovery Drill',
      description: 'Aerobic threshold workouts, sprinting drills, and ice bath recovery tips.',
      dateTime: new Date('2026-07-28T09:00:00.000Z'),
      team: team1._id,
      duration: 120,
      playersAttended: [
        { player: player1._id, status: 'Present' },
        { player: player2._id, status: 'Present' },
        { player: player3._id, status: 'Excused' },
        { player: player4._id, status: 'Present' },
        { player: player6._id, status: 'Present' },
      ]
    });

    // 8. Create News
    await News.create({
      title: 'GoalSync FC clinches 3-1 victory against Starlight United!',
      content: 'In a stunning regional showdown, GoalSync FC secured a dominant win with a spectacular brace by Ijas Ahamed and a clinical chip from Mohamed Salah. The tactics proved highly effective as the midfield defense locked down the opponent. The team shifts focus to Tornado Rangers on Aug 5.',
      author: adminUser._id,
    });

    await News.create({
      title: 'Pre-Season Medical and Drills Schedule',
      content: 'All player profiles must submit physical recovery test records by the end of this week. Official squad jerseys are now distributed. Make sure to update your profile photo on the portal settings drawer.',
      author: adminUser._id,
    });

    console.log('Database successfully seeded!');
    console.log('\n--- Default Login Credentials ---');
    console.log('Admin: admin@goalsync.com / password123');
    console.log('Coach: coach@goalsync.com / password123');
    console.log('Player: player@goalsync.com / password123');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
