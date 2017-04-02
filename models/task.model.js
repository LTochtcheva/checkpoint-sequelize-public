'use strict';

var db = require('./database');
var Sequelize = require('sequelize');

// Make sure you have `postgres` running!

var Task = db.define('Task', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  due: Sequelize.DATE
}, {
  //---------VVVV---------  your code below  ---------VVV----------
  getterMethods: {
    timeRemaining: function() {
      if ( !this.due) return Infinity;
      let date = new Date();
      return  this.due - date;
    },
    overdue: function() {
      let isOverdue;
      let timeDiff = this.due - new Date();
      isOverdue =  timeDiff >= 0 ? false : true;
      if (this.complete === true) isOverdue = false;
      return isOverdue;
    }
  },
  classMethods: {
    clearCompleted: function() {
      return this.destroy({
        where: {
          complete: true
        }
      })
    },
    completeAll: function() {
      return this.update({
        complete: true
      },{
        where: {
          complete: false
        }
      })
    }
  },
  instanceMethods: {
    addChild: function(child) {
      return Task.create({
        name: child.name,
        parentId: this.id});
    },
    getChildren: function() {
      return Task.findAll({
        where: {
          parentId: this.id
        }
      })
    },
    getSiblings: function() {
        return Task.findAll({
                  where: {
                     id: { $ne: this.id},
                     parentId: this.parentId
                  }
               });
    }
  },
  hooks: {
    beforeDestroy: function(task) {
      task.destroy({
        where: {
          parentId: task.id
        }
      })
    }
  }

  //---------^^^---------  your code above  ---------^^^----------
});

Task.belongsTo(Task, {as: 'parent'});





module.exports = Task;

