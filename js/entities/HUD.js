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
        this.maxPiglets = 4;
        this.piglets = this.maxPiglets;
        for (var i = this.maxPiglets - 1; i >= 0; i--) {
          this.addChild(new game.HUD.PigletItem(1 + ((16 + 1) * i) , 1));
        }
    },

    /**
     *  When a piglet is picked up, call this function to remove
     *  it from the HUD and count it in the score
     */
    pigletRescued: function() {
        // remove a piglet
        this.piglets--;
        console.log(this.piglets);

        // if enough piglets
        if(this.piglets >= 0){
          // remove a piglet from the screen
          // TODO : check needed value for 'keepAlive' parameter
          //(depends if init is called again when we init the game again)
          this.removeChild(this.getChildAt(this.piglets), false);
        }

        // if no more piglets
        if(this.piglets <= 0){
          // A WINNER IS YOU
          // TODO : winning screen
          console.log("win");
        }
    }
});


/**
* a piglet hud indicator telling the number of piglets still alive
*/
game.HUD.PigletItem = me.Sprite.extend({

  /**
   * constructor
   */
  init: function(x, y) {
    // call the parent constructor
    this._super(me.Sprite, 'init', [x, y, {image: "hudPiglet"}]);
  },

  /**
   * update function
   */
  update : function (dt) {
    // we don't do anything for the moment here
    //TODO : disable rendering when saved
    return false;
  }
});
