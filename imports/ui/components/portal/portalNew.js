import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Smart Contracts
import web3 from '/imports/lib/web3/client';
import contract from 'truffle-contract';
import VersionJson from '/imports/melon/contracts/Version.json';
import addressList from '/imports/melon/interface/addressList';

import './portalNew.html';

const Version = contract(VersionJson);


Template.portalNew.onCreated(() => {
  Session.set('showModal', true);
  Meteor.subscribe('cores');
  Meteor.subscribe('universes');
});

Template.portalNew.helpers({
  ...addressList,
});

Template.portalNew.onRendered(() => {});

Template.portalNew.events({
  'shown.bs.modal #myModal': (event) => {
    // Prevent default browser form submit
    event.preventDefault();
  },
  'change form#new_portfolio #universe_select': (event) => {
    // Get value from form element
    const target = event.target;
    if (target.value === 'melon') {
      // Materialize.toast('Good choice. Now verifiy the accuracy of this registar', 4000, 'blue');
      Session.set('selectedRegistarIsMelon', true);
    }
  },
  'submit form#new_portfolio': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();
    Version.setProvider(web3.currentProvider);

    if (!templateInstance.find('input#portfolio_name').value) {
      alert('Please enter a portfolio name.');
      return;
    }
    // Description input parameters
    const PORTFOLIO_NAME = templateInstance.find('input#portfolio_name').value;
    const PORTFOLIO_SYMBOL = 'MLN-P';
    const PORTFOLIO_DECIMALS = 18;
    // Deploy
    const versionContract = Version.at(addressList.version);
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });
    versionContract.createCore(
      PORTFOLIO_NAME,
      PORTFOLIO_SYMBOL,
      PORTFOLIO_DECIMALS,
      /* TODO take below address from user input */
      addressList.universe,
      addressList.subscribe,
      addressList.redeem,
      addressList.riskMgmt,
      addressList.managementFee,
      addressList.performanceFee,
      { from: Session.get('selectedAccount') },
    )
    .then((result) => {
      let id;
      for (let i = 0; i < result.logs.length; i += 1) {
        if (result.logs[i].event === 'CoreUpdate') {
          id = result.logs[i].args.id.toNumber();
          console.log('Core has been created');
          console.log(`Core id: ${id}`);
          Meteor.call('cores.syncCoreById', id);
          Session.set('isNew', true);
          toastr.success('Fund successfully created!');
        }
      }
      return versionContract.getCore(id);
    })
    .then((info) => {
      const [address, owner, , , , ] = info;
      Meteor.call('universes.insert',
        Session.get('universeContractAddress'),
        address,
        owner,
      );
      Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
      FlowRouter.go(`/portfolio/${address}`);
    }).catch((err) => {
      toastr.error('Oops, an error has occured. Please verify your fund informations.');
      Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
      throw err;
    });
  },
});

Template.disclaimerModal.events({
  'click button#okDisclaimer': (event) => {
    Session.set('showModal', false);
  },
});
