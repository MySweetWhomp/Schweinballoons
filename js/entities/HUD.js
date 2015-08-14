/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};
game.HUD.Container = me.Container.extend({

    /**
     * constructor
     */
    init: function() {
        // call the constructor
        this._super(me.Container, 'init');
        this.name = 'HUD';

        // persistent across level change
        this.isPersistent = true;

        // make sure we use screen coordinates
        this.floating = true;

        // make sure our object always draws first
        this.z = Infinity;

        // add all piglets
        this.maxPiglets = me.game.world.getChildByName("piglet").length;
        this.piglets = this.maxPiglets;

        this.addChild(new me.Sprite(0, 0, {image: "HUDback"}));
        for (var i = this.maxPiglets - 1; i >= 0; --i) {
          this.addChild(new game.HUD.PigletItem(1 + ((9 + 1) * i) , 1));
        }
    },

    /**
     *  When a piglet is picked up, call this function to remove
     *  it from the HUD and count it in the score
     */
    pigletRescued: function() {
        // remove a piglet
        --this.piglets;

        // if enough piglets
        if (this.piglets >= 0) {
          // remove a piglet from the screen
          this.getChildAt(this.piglets).rescue();
        }

        // if no more piglets
        if (this.piglets <= 0) {
          // A WINNER IS YOU
          // TODO : winning screen
          console.log("win");
        }
    }
});


/**
* a piglet hud indicator telling the number of piglets still alive
*/
game.HUD.PigletItem = me.AnimationSheet.extend({

    /**
    * constructor
    */
    init: function(x, y) {
        // call the parent constructor
        this._super(me.AnimationSheet, 'init', [x, y, {image: "HUD", framewidth: 9, frameheight: 9}]);

        // animations
        this.addAnimation('notrescued', [0], 100);
        this.addAnimation('rescued', [1], 100);

        // kidnap the piglet
        this.kidnap();
    },

    /**
    * update function
    */
    update : function (dt) {
        // we don't do anything for the moment here
        //TODO : disable rendering when saved
        return false;
    },

    rescue: function() {
        if(!this.isCurrentAnimation('rescued'))
            this.setCurrentAnimation('rescued');
    },

    kidnap: function() {
        if(!this.isCurrentAnimation('notrescued'))
            this.setCurrentAnimation('notrescued');
    }

});
