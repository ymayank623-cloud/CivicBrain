const cron = require('node-cron');
const MasterTicket = require('../models/MasterTicket');
const Complaint = require('../models/Complaint');

// SLA Configuration in hours
const SLA_CONFIG = {
  'Open Manhole': 4,
  'Water Leak': 4,
  'Garbage': 24,
  'Road Repair': 48,
  'Streetlight': 48,
  'Default': 48
};

const runEscalationEngine = (io) => {
  // Run every hour in production. Running every 15 minutes for faster evaluation
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CIVIC-BRAIN] Running SLA Escalation Engine (Cron Job)...');

    try {
      const activeTickets = await MasterTicket.find({
        status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] }
      });

      for (let ticket of activeTickets) {
        const categorySlaHours = SLA_CONFIG[ticket.category] || SLA_CONFIG['Default'];
        const totalSlaMs = categorySlaHours * 60 * 60 * 1000;
        
        const now = Date.now();
        const createdAt = new Date(ticket.createdAt).getTime();
        const elapsedMs = now - createdAt;
        
        const elapsedPercentage = (elapsedMs / totalSlaMs) * 100;

        let needsUpdate = false;
        let eventType = null;

        // RULE 2: 100% SLA Breached -> Auto-escalate to Commissioner
        if (elapsedPercentage >= 100 && !ticket.isEscalatedToCommissioner) {
          ticket.isEscalatedToCommissioner = true;
          ticket.priority = 'CRITICAL';
          ticket.escalationAlert = 'RED ALERT: SLA Breached';
          needsUpdate = true;
          eventType = 'COMMISSIONER_ESCALATION';
          console.log(`[ESCALATION] Ticket ${ticket._id} ESCALATED TO COMMISSIONER (SLA Breached)`);
        }
        // RULE 1: 75% Time Elapsed & Unassigned -> Dept Head Alert
        else if (elapsedPercentage >= 75 && ticket.status === 'OPEN' && !ticket.deptHeadAlert) {
          ticket.deptHeadAlert = true;
          ticket.escalationAlert = 'WARNING: 75% SLA Elapsed & Unassigned';
          needsUpdate = true;
          eventType = 'DEPT_WARNING';
          console.log(`[ESCALATION] Ticket ${ticket._id} TRIGGERED DEPT HEAD ALERT (75% Elapsed)`);
        }

        if (needsUpdate) {
          await ticket.save();
          if (io && eventType) {
            io.emit('ticket_escalated', {
              ticketId: ticket._id,
              type: eventType,
              alert: ticket.escalationAlert
            });
          }
        }
      }
    } catch (error) {
      console.error('[CIVIC-BRAIN] Escalation Engine Error:', error);
    }
  });
};

module.exports = runEscalationEngine;
