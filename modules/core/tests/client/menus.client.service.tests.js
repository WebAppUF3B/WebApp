'use strict';

(function() {
  describe('Menus', () => {
    //Initialize global variables
    let scope,
      Menus;

    // Load the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    beforeEach(inject((_Menus_) => {
      Menus = _Menus_;
    }));

    it('should have topbar added', () => {
      expect(Menus.menus.topbar).toBeDefined();
    });

    it('should have default roles to user and admin', () => {
      expect(Menus.defaultRoles).toEqual(['user', 'admin']);
    });

    describe('addMenu', () => {
      describe('with no options', () => {
        const menuId = 'menu1';
        let menu;
        beforeEach(() => {
          menu = Menus.addMenu(menuId);
        });

        it('should return menu object', () => {
          expect(menu).toBeDefined();
        });

        it('should default roles', () => {
          expect(menu.roles).toEqual(Menus.defaultRoles);
        });

        it('should have empty items', () => {
          expect(menu.items).toEqual([]);
        });

        it('should set shouldRender to shouldRender function handle', () => {
          expect(menu.shouldRender()).toBeFalsy();
        });
      });

      describe('with options', () => {
        let menu;
        const options = {
          roles: ['a', 'b', 'c'],
          items: ['d', 'e', 'f']
        };
        beforeEach(() => {
          menu = Menus.addMenu('menu1', options);
        });

        it('should set items to options.items list', () => {
          expect(menu.items).toBe(options.items);
        });

        it('should set roles to options.roles list', () => {
          expect(menu.roles).toBe(options.roles);
        });
      });
    });

    describe('shouldRender', () => {
      const menuOptions = {
        roles: ['*', 'menurole']
      };
      let menu;
      beforeEach(() => {
        menu = Menus.addMenu('menu1', menuOptions);
      });

      describe('when logged out', () => {
        it('should render if menu is public', () => {
          expect(menu.shouldRender()).toBeTruthy();
        });

        it('should not render if menu is private', () => {
          menu = Menus.addMenu('menu1', {
            isPublic: false
          });
          expect(menu.shouldRender()).toBeFalsy();
        });
      });

      describe('when logged in', () => {
        let user = {
          roles: ['1', 'menurole', '2']
        };
        describe('menu with * role', () => {
          it('should render', () => {
            expect(menu.shouldRender(user)).toBeTruthy();
          });
        });

        describe('menu without * role', () => {
          beforeEach(() => {
            menu = Menus.addMenu('menu1', {
              roles: ['b', 'menurole', 'c']
            });
          });

          it('should render if user has same role as menu', () => {
            expect(menu.shouldRender(user)).toBeTruthy();
          });

          it('should not render if user has different roles', () => {
            user = {
              roles: ['1', '2', '3']
            };
            expect(menu.shouldRender(user)).toBeFalsy();
          });
        });
      });
    });

    describe('validateMenuExistance', () => {
      describe('when menuId not provided', () => {
        it('should throw menuId error', () => {
          expect(Menus.validateMenuExistance).toThrowError('MenuId was not provided');
        });
      });

      describe('when menu does not exist', () => {
        it('should throw no menu error', () => {
          const target = function() {
            Menus.validateMenuExistance('noMenuId');
          };
          expect(target).toThrowError('Menu does not exist');
        });
      });

      describe('when menu exists', () => {
        const menuId = 'menuId';
        beforeEach(() => {
          Menus.menus[menuId] = {};
        });

        it('should return truthy', () => {
          expect(Menus.validateMenuExistance(menuId)).toBeTruthy();
        });
      });
    });

    describe('removeMenu', () => {
      const menu = {
        id: 'menuId'
      };
      beforeEach(() => {
        Menus.menus[menu.id] = menu;
        Menus.validateMenuExistance = jasmine.createSpy();
        Menus.removeMenu(menu.id);
      });

      it('should remove existing menu from menus', () => {
        expect(Menus.menus).not.toContain(menu.id);
      });

      it('validates menu existance before removing', () => {
        expect(Menus.validateMenuExistance).toHaveBeenCalledWith(menu.id);
      });
    });

    describe('addMenuItem', () => {
      const menuId = 'menu1';
      const subMenuItem1 = {
          title: 'sub1'
        },
        subMenuItem2 = {
          title: 'sub2'
        },
        menuItemOptions = {
          title: 'title',
          state: 'state',
          type: 'type',
          class: 'class',
          isPublic: false,
          roles: ['a', 'b'],
          position: 2,
          items: [subMenuItem1, subMenuItem2]
        };
      let menu;
      let menuItem;

      beforeEach(() => {
        Menus.validateMenuExistance = jasmine.createSpy();
        Menus.addSubMenuItem = jasmine.createSpy();
        Menus.addMenu(menuId, {
          roles: ['a', 'b']
        });
        menu = Menus.addMenuItem(menuId, menuItemOptions);
        menuItem = menu.items[0];
      });

      it('should validate menu existance', () => {
        expect(Menus.validateMenuExistance).toHaveBeenCalledWith(menuId);
      });

      it('should return the menu', () => {
        expect(menu).toBeDefined();
      });

      it('should set menu item shouldRender function', () => {
        expect(menuItem.shouldRender).toBeDefined();
      });

      describe('with options set', () => {
        it('should add menu item to menu', () => {
          expect(menu.items.length).toBe(1);
        });

        it('should set menu item title to options title', () => {
          expect(menuItem.title).toBe(menuItemOptions.title);
        });

        it('should set menu item state to options state', () => {
          expect(menuItem.state).toBe(menuItemOptions.state);
        });

        it('should set menu item type to options type', () => {
          expect(menuItem.type).toBe(menuItemOptions.type);
        });

        it('should set menu item class to options class', () => {
          expect(menuItem.class).toBe(menuItemOptions.class);
        });

        it('should set menu item position to options position', () => {
          expect(menuItem.position).toBe(menuItemOptions.position);
        });

        it('should call addSubMenuItem for each item in options', () => {
          expect(Menus.addSubMenuItem).toHaveBeenCalledWith(menuId, menuItemOptions.state, subMenuItem1);
          expect(Menus.addSubMenuItem).toHaveBeenCalledWith(menuId, menuItemOptions.state, subMenuItem2);
        });
      });

      describe('without options set', () => {
        beforeEach(() => {
          menu = Menus.addMenuItem(menuId);
          menuItem = menu.items[1];
        });

        it('should set menu item type to item', () => {
          expect(menuItem.type).toBe('item');
        });

        it('should set menu item title to empty', () => {
          expect(menuItem.title).toBe('');
        });

        it('should set menu item isPublic to false', () => {
          expect(menuItem.isPublic).toBeFalsy();
        });

        it('should set menu item roles to default roles', () => {
          expect(menuItem.roles).toEqual(Menus.defaultRoles);
        });

        it('should set menu item position to 0', () => {
          expect(menuItem.position).toBe(0);
        });
      });
    });

    describe('removeMenuItem', () => {
      const menuId = 'menuId',
        menuItemState = 'menu.state1',
        menuItemState2 = 'menu.state2';
      let menu;

      beforeEach(() => {
        Menus.addMenu(menuId);
        Menus.addMenuItem(menuId, { state: menuItemState });
        Menus.addMenuItem(menuId, { state: menuItemState2 });
        Menus.validateMenuExistance = jasmine.createSpy();
        menu = Menus.removeMenuItem(menuId, menuItemState);
      });

      it('should return menu object', () => {
        expect(menu).not.toBeNull();
      });

      it('should validate menu existance', () => {
        expect(Menus.validateMenuExistance).toHaveBeenCalledWith(menuId);
      });

      it('should remove sub menu items with same state', () => {
        expect(menu.items.length).toBe(1);
        expect(menu.items[0].state).toBe(menuItemState2);
      });
    });

    describe('addSubMenuItem', () => {
      const subItemOptions = {
        title: 'title',
        state: 'sub.state',
        isPublic: false,
        roles: ['a', 'b'],
        position: 4
      };
      const menuId = 'menu1',
        menuItem1Options = {
          state: 'item1.state',
          items: [],
          isPublic: false
        },
        menuItem2Options = {
          state: 'item2.state2',
          items: [],
          isPublic: true,
          roles: ['a']
        };
      let menuItem1;
      let menuItem2;
      let menuItem3;
      let subItem1;
      let subItem2;
      let menu;

      beforeEach(() => {
        Menus.validateMenuExistance = jasmine.createSpy();
        Menus.addMenu(menuId);
        Menus.addMenuItem(menuId, menuItem1Options);
        Menus.addMenuItem(menuId, menuItem2Options);
        Menus.addMenuItem(menuId, { state: 'something.else' });
        Menus.addSubMenuItem(menuId, menuItem1Options.state, subItemOptions);
        menu = Menus.addSubMenuItem(menuId, menuItem1Options.state);
        menuItem1 = menu.items[0];
        menuItem2 = menu.items[1];
        menuItem3 = menu.items[2];
        subItem1 = menuItem1.items[0];
        subItem2 = menuItem1.items[1];
      });

      afterEach(() => {
        Menus.removeMenu(menuId);
      });

      it('should return menu object', () => {
        expect(menu).not.toBeNull();
      });

      it('should validate menu existance', () => {
        expect(Menus.validateMenuExistance).toHaveBeenCalledWith(menuId);
      });

      it('should not add sub menu item to menu item of different state', () => {
        expect(menuItem3.items.length).toBe(0);
      });

      it('should set shouldRender', () => {
        expect(subItem1.shouldRender).toBeDefined();
      });

      describe('with options set', () => {
        it('should add sub menu item to menu item', () => {
          expect(subItem1).toBeDefined();
        });

        it('should set title to options title', () => {
          expect(subItem1.title).toBe(subItemOptions.title);
        });

        it('should set state to options state', () => {
          expect(subItem1.state).toBe(subItemOptions.state);
        });

        it('should set roles to options roles', () => {
          expect(subItem1.roles).toEqual(subItemOptions.roles);
        });

        it('should set position to options position', () => {
          expect(subItem1.position).toEqual(subItemOptions.position);
        });
      });

      describe('without optoins set', () => {
        it('should add sub menu item to menu item', () => {
          expect(subItem2).toBeDefined();
        });

        it('should set isPublic to parent isPublic', () => {
          expect(subItem2.isPublic).toBe(menuItem1.isPublic);
        });

        it('should set title to blank', () => {
          expect(subItem2.title).toBe('');
        });

        it('should set state to blank', () => {
          expect(subItem2.state).toBe('');
        });

        it('should set roles to parent roles', () => {
          expect(subItem2.roles).toEqual(menuItem1.roles);
        });

        it('should set position to 0', () => {
          expect(subItem2.position).toBe(0);
        });
      });
      
      describe('then removeSubMenuItem', () => {
        beforeEach(() => {
          Menus.validateMenuExistance = jasmine.createSpy();
          menu = Menus.removeSubMenuItem(menuId, subItem1.state);
        });
  
        it('should validate menu existance', () => {
          expect(Menus.validateMenuExistance).toHaveBeenCalledWith(menuId);
        });
  
        it('should return menu object', () => {
          expect(menu).toBeDefined();
        });
  
        it('should remove sub menu item', () => {
          expect(menuItem1.items.length).toBe(1);
          expect(menuItem1.items[0].state).toEqual(subItem2.state);
        });
      });
    });
  });
})();
