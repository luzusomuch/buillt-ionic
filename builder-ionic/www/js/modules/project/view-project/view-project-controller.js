angular.module('buiiltApp').controller('ViewProjectCtrl', function($state,$rootScope,$scope,$stateParams,
  team,projectService,contractorService,materialPackageService,staffPackages,builderPackage) {

  projectService.get({id: $stateParams.id}).$promise.then(function(project){
    $scope.project=project;
  });

  $scope.builderPackage = builderPackage;
  contractorService.get({id : $stateParams.id}).$promise.then(function(contractorPackages){
    $scope.contractorPackages = contractorPackages;
  });
  materialPackageService.get({id : $stateParams.id}).$promise.then(function(materialPackages){
    $scope.materialPackages = materialPackages;
  });
  $scope.staffPackages = staffPackages
  $scope.team = team;

  $scope.defaultType = "Choose package";

  $scope.headingName = "Heading name";
  $scope.showBuilderPackage = false;
  $scope.showContractorPackages = false;
  $scope.showMaterialPackages = false;
  $scope.showStaffPackages = false;

  // if (team.type == 'client') {
  //   $scope.showBuilderPackage = true;
  // }
  // else if (team.type == 'contractor') {
  //   $scope.showContractorPackages = true;
  // }
  // else if (team.type == 'supplier') {
  //   $scope.showMaterialPackages = true;
  // }
  // else {
  //   $scope.showBuilderPackage = true;
  // }

  $scope.clickChange = function(value){
    // console.log(value);
    if (value === 'Client' || value === 'Builder') {
      // if (team.type == 'homeOwner') {
      //   $scope.headingName = 'Builder';
      // }
      // else if (team.type == 'builder') {
      //   $scope.headingName = 'Client';
      // }
      // $scope.showBuilderPackage = true;
      // $scope.showContractorPackages = false;
      // $scope.showMaterialPackages = false;
      // $scope.showStaffPackages = false;
      $state.go("client",{id: builderPackage.project._id});
    }
    else if (value === 'Contracts' || value === 'Subcontractors') {
      if (team.type == 'contractor') {
        $scope.headingName = 'Contracts';
      }
      else if (team.type == 'builder') {
        $scope.headingName = 'Subcontractors';
      }
      $scope.showBuilderPackage = false;
      $scope.showContractorPackages = true;
      $scope.showMaterialPackages = false;
      $scope.showStaffPackages = false;
    }
    else if (value === 'Materials' || value === 'Suppliers') {
      if (team.type == 'material') {
        $scope.headingName = 'Materials';
      }
      else if (team.type == 'builder') {
        $scope.headingName = 'Suppliers';
      }
      $scope.showBuilderPackage = false;
      $scope.showContractorPackages = false;
      $scope.showMaterialPackages = true;
      $scope.showStaffPackages = false;
    }
    else if (value === 'Employees') {
      $scope.headingName = 'Employees';
      $scope.showBuilderPackage = false;
      $scope.showContractorPackages = false;
      $scope.showMaterialPackages = false;
      $scope.showStaffPackages = true;
    }
  };
});