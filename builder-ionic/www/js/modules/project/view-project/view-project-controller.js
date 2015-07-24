angular.module('buiiltApp').controller('ViewProjectCtrl', function($rootScope,$scope,
  team,project,contractorPackages,materialPackages,staffPackages,builderPackage) {
  $scope.project=project;
  $scope.builderPackage = builderPackage;
  $scope.contractorPackages = contractorPackages;
  $scope.materialPackages = materialPackages;
  $scope.staffPackages = staffPackages
  $scope.team = team;
  $scope.headingName = "Heading name";
  $scope.showBuilderPackage = false;
  $scope.showContractorPackages = false;
  $scope.showMaterialPackages = false;
  $scope.showStaffPackages = false;

  if (team.type == 'client') {
    $scope.showBuilderPackage = true;
  }
  else if (team.type == 'contractor') {
    $scope.showContractorPackages = true;
  }
  else if (team.type == 'supplier') {
    $scope.showMaterialPackages = true;
  }
  else {
    $scope.showBuilderPackage = true;
  }

  $scope.clickChange = function(value){
    if (value === 'Client' || value === 'Builder') {
      if (team.type == 'homeOwner') {
        $scope.headingName = 'Builder';
      }
      else if (team.type == 'builder') {
        $scope.headingName = 'Client';
      }
      $scope.showBuilderPackage = true;
      $scope.showContractorPackages = false;
      $scope.showMaterialPackages = false;
      $scope.showStaffPackages = false;
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