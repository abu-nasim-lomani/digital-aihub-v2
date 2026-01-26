# PowerShell script to temporarily fix Supabase imports
$files = @(
    "src\pages\Team.jsx",
    "src\pages\Standards.jsx",
    "src\pages\Projects.jsx",
    "src\pages\ProjectDetail.jsx",
    "src\pages\Learning.jsx",
    "src\pages\Initiatives.jsx",
    "src\pages\InitiativeDetail.jsx",
    "src\pages\Events.jsx",
    "src\pages\EventDetail.jsx",
    "src\pages\admin\ManageTeam.jsx",
    "src\pages\admin\ManageSupportRequests.jsx",
    "src\pages\admin\ManageStandards.jsx",
    "src\pages\admin\ManageProjects.jsx",
    "src\pages\admin\ManageLearning.jsx",
    "src\pages\admin\ManageInitiatives.jsx",
    "src\pages\admin\ManageEvents.jsx",
    "src\pages\admin\Dashboard.jsx"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Comment out supabase imports
    $content = $content -replace "import \{ supabase \} from ['`"].*supabase/config['`"];", "// import { supabase } from '../supabase/config'; // TEMP DISABLED"
    $content = $content -replace "import \{ fetchCollection \} from ['`"].*supabaseHelpers['`"];", "// import { fetchCollection } from '../utils/supabaseHelpers'; // TEMP DISABLED"
    
    Set-Content -Path $file -Value $content
    Write-Host "Fixed: $file"
}

Write-Host "`nAll files fixed! Frontend should now start without errors."
Write-Host "Note: Pages will show 'Under Migration' message until properly migrated."
