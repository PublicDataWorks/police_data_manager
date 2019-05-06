"use strict";
module.exports = (sequelize, DataTypes) => {
  const Audit = sequelize.define(
    "audit",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      auditAction: {
        field: "audit_action",
        type: DataTypes.STRING,
        allowNull: false
      },
      user: {
        field: "user",
        type: DataTypes.STRING,
        allowNull: false
      },
      createdAt: {
        field: "created_at",
        type: DataTypes.DATE
      },
      updatedAt: {
        field: "updated_at",
        type: DataTypes.DATE
      }
    },
    {
      tableName: "audits"
    }
  );

  Audit.associate = models => {
    Audit.belongsTo(models.cases, {
      foreignKey: { name: "caseId", field: "case_id" }
    });
  };

  return Audit;
};
