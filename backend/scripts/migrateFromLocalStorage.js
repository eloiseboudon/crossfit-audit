/**
 * SCRIPT DE MIGRATION DEPUIS LOCALSTORAGE VERS API
 * 
 * Ce script aide à migrer les données depuis localStorage vers la base de données backend
 * À exécuter côté frontend/navigateur
 */

const API_URL = 'http://localhost:5176/api'; // Adapter selon votre configuration

class LocalStorageMigration {
  constructor(apiUrl, authToken) {
    this.apiUrl = apiUrl;
    this.authToken = authToken;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };
  }

  // Récupérer les données du localStorage
  getLocalStorageData() {
    const data = {
      auth: this.parseJSON(localStorage.getItem('crossfit_audit_auth')),
      gyms: this.parseJSON(localStorage.getItem('crossfit_audit_gyms')),
      audits: this.parseJSON(localStorage.getItem('crossfit_audit_audits')),
      answers: this.parseJSON(localStorage.getItem('crossfit_audit_answers')),
      kpis: this.parseJSON(localStorage.getItem('crossfit_audit_kpis')),
      scores: this.parseJSON(localStorage.getItem('crossfit_audit_scores')),
      recommendations: this.parseJSON(localStorage.getItem('crossfit_audit_recommendations')),
      competitors: this.parseJSON(localStorage.getItem('crossfit_audit_market_benchmarks')),
      zones: this.parseJSON(localStorage.getItem('crossfit_audit_market_zones')),
      offers: this.parseJSON(localStorage.getItem('crossfit_audit_gym_offers'))
    };

    console.log('📊 Données récupérées du localStorage:', data);
    return data;
  }

  parseJSON(item) {
    try {
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      return null;
    }
  }

  // Migrer les salles
  async migrateGyms(gyms) {
    if (!gyms || gyms.length === 0) {
      console.log('⚠️ Aucune salle à migrer');
      return [];
    }

    console.log(`🏋️ Migration de ${gyms.length} salle(s)...`);
    const migratedGyms = [];

    for (const gym of gyms) {
      try {
        const response = await fetch(`${this.apiUrl}/gyms`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(gym)
        });

        if (response.ok) {
          const result = await response.json();
          migratedGyms.push(result.data);
          console.log(`✅ Salle migrée: ${gym.name}`);
        } else {
          console.error(`❌ Erreur migration salle ${gym.name}:`, await response.text());
        }
      } catch (error) {
        console.error(`❌ Erreur migration salle ${gym.name}:`, error);
      }
    }

    return migratedGyms;
  }

  // Migrer les audits
  async migrateAudits(audits, gymMapping) {
    if (!audits || audits.length === 0) {
      console.log('⚠️ Aucun audit à migrer');
      return [];
    }

    console.log(`📋 Migration de ${audits.length} audit(s)...`);
    const migratedAudits = [];

    for (const audit of audits) {
      try {
        // Mapper l'ancien gym_id au nouveau
        const newGymId = gymMapping[audit.gym_id];
        if (!newGymId) {
          console.warn(`⚠️ Gym ID ${audit.gym_id} non trouvé, skip audit`);
          continue;
        }

        const auditData = {
          ...audit,
          gym_id: newGymId
        };

        const response = await fetch(`${this.apiUrl}/audits`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(auditData)
        });

        if (response.ok) {
          const result = await response.json();
          migratedAudits.push(result.data);
          console.log(`✅ Audit migré: ${audit.id}`);
        } else {
          console.error(`❌ Erreur migration audit ${audit.id}:`, await response.text());
        }
      } catch (error) {
        console.error(`❌ Erreur migration audit ${audit.id}:`, error);
      }
    }

    return migratedAudits;
  }

  // Migrer les réponses d'un audit
  async migrateAnswers(auditId, answers) {
    if (!answers || answers.length === 0) {
      console.log(`⚠️ Aucune réponse pour l'audit ${auditId}`);
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/audits/${auditId}/answers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ answers })
      });

      if (response.ok) {
        console.log(`✅ ${answers.length} réponses migrées pour audit ${auditId}`);
      } else {
        console.error(`❌ Erreur migration réponses:`, await response.text());
      }
    } catch (error) {
      console.error(`❌ Erreur migration réponses:`, error);
    }
  }

  // Migration complète
  async migrateAll() {
    console.log('🚀 ======================================');
    console.log('🚀 DÉBUT DE LA MIGRATION');
    console.log('🚀 ======================================\n');

    const data = this.getLocalStorageData();

    // 1. Migrer les salles
    console.log('\n📍 ÉTAPE 1/4 : Migration des salles');
    const migratedGyms = await this.migrateGyms(data.gyms);

    // Créer un mapping ancien ID -> nouveau ID
    const gymMapping = {};
    if (data.gyms && migratedGyms) {
      data.gyms.forEach((oldGym, index) => {
        if (migratedGyms[index]) {
          gymMapping[oldGym.id] = migratedGyms[index].id;
        }
      });
    }

    // 2. Migrer les audits
    console.log('\n📍 ÉTAPE 2/4 : Migration des audits');
    const migratedAudits = await this.migrateAudits(data.audits, gymMapping);

    // Créer un mapping ancien ID -> nouveau ID pour les audits
    const auditMapping = {};
    if (data.audits && migratedAudits) {
      data.audits.forEach((oldAudit, index) => {
        if (migratedAudits[index]) {
          auditMapping[oldAudit.id] = migratedAudits[index].id;
        }
      });
    }

    // 3. Migrer les réponses
    console.log('\n📍 ÉTAPE 3/4 : Migration des réponses');
    if (data.answers) {
      for (const [oldAuditId, answers] of Object.entries(data.answers)) {
        const newAuditId = auditMapping[oldAuditId];
        if (newAuditId && Array.isArray(answers)) {
          await this.migrateAnswers(newAuditId, answers);
        }
      }
    }

    // 4. Statistiques finales
    console.log('\n📍 ÉTAPE 4/4 : Résumé');
    console.log('\n✅ ======================================');
    console.log('✅ MIGRATION TERMINÉE');
    console.log('✅ ======================================');
    console.log(`📊 Statistiques:`);
    console.log(`   - Salles migrées: ${migratedGyms.length}`);
    console.log(`   - Audits migrés: ${migratedAudits.length}`);
    console.log(`\n💡 Les données ont été migrées vers la base de données !`);
    console.log(`💡 Vous pouvez maintenant utiliser l'API pour gérer vos données.`);

    return {
      gyms: migratedGyms,
      audits: migratedAudits,
      gymMapping,
      auditMapping
    };
  }
}

// ============================================
// UTILISATION
// ============================================

/**
 * 1. Se connecter à l'API et récupérer un token
 * 2. Ouvrir la console du navigateur (F12)
 * 3. Copier/coller ce script
 * 4. Exécuter :
 * 
 * const migration = new LocalStorageMigration('http://localhost:5176/api', 'VOTRE_TOKEN_JWT');
 * await migration.migrateAll();
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🏋️ SCRIPT DE MIGRATION LOCALSTORAGE → API 🏋️           ║
║                                                                ║
║  Ce script va migrer vos données localStorage vers l'API      ║
║                                                                ║
║  INSTRUCTIONS :                                                ║
║  1. Créez un compte sur l'API : POST /api/auth/register       ║
║  2. Récupérez votre token JWT                                 ║
║  3. Exécutez :                                                ║
║                                                                ║
║     const migration = new LocalStorageMigration(              ║
║       'http://localhost:5176/api',                            ║
║       'VOTRE_TOKEN_ICI'                                       ║
║     );                                                         ║
║     await migration.migrateAll();                             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);
