# Quick Fix Script - Replace Page Content

# This script replaces all unmigrated pages with UnderMigration component

$pages = @(
    @{Path="src\pages\Projects.jsx"; Name="Projects & Supports"},
    @{Path="src\pages\ProjectDetail.jsx"; Name="Project Details"},
    @{Path="src\pages\Initiatives.jsx"; Name="Initiatives"},
    @{Path="src\pages\InitiativeDetail.jsx"; Name="Initiative Details"},
    @{Path="src\pages\Events.jsx"; Name="Events & Archive"},
    @{Path="src\pages\EventDetail.jsx"; Name="Event Details"},
    @{Path="src\pages\Learning.jsx"; Name="Learning & Capacity"},
    @{Path="src\pages\Standards.jsx"; Name="Standards & Best Practices"},
    @{Path="src\pages\Team.jsx"; Name="Team & Advisory"},
    @{Path="src\pages\admin\Dashboard.jsx"; Name="Admin Dashboard"},
    @{Path="src\pages\admin\ManageProjects.jsx"; Name="Manage Projects"},
    @{Path="src\pages\admin\ManageInitiatives.jsx"; Name="Manage Initiatives"},
    @{Path="src\pages\admin\ManageEvents.jsx"; Name="Manage Events"},
    @{Path="src\pages\admin\ManageLearning.jsx"; Name="Manage Learning"},
    @{Path="src\pages\admin\ManageStandards.jsx"; Name="Manage Standards"},
    @{Path="src\pages\admin\ManageTeam.jsx"; Name="Manage Team"},
    @{Path="src\pages\admin\ManageSupportRequests.jsx"; Name="Manage Support Requests"}
)

foreach ($page in $pages) {
    $template = @"
import UnderMigration from '../components/UnderMigration';

const Page = () => {
  return <UnderMigration pageName="$($page.Name)" />;
};

export default Page;
"@
    
    # Adjust import path for admin pages
    if ($page.Path -like "*admin*") {
        $template = $template -replace "from '../components", "from '../../components"
    }
    
    Set-Content -Path $page.Path -Value $template
    Write-Host "Replaced: $($page.Path)"
}

Write-Host "`n✅ All pages replaced with UnderMigration component!"
Write-Host "Frontend should now start without errors."
