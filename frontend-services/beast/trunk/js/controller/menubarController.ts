/**
 * Created by Paul on 22.05.2017.
 */
    
    ///<reference path="../d_ts/jquery.d.ts" />
    ///<reference path="../model/model.ts" />

class MenubarController
{
    //called when "Project > New" button is clicked
    public static createProject() : void
        {
            //TODO: check if current project is saved
            if (MenubarController.continueWarningDialog())
            {
                //instantiate project
            }
        }
    
    public static openProject() : void
        {
            //TODO: check if current project is saved
            //if (MenubarController.continueWarningDialog())
            //{
            //}
            
            let file = MenubarController.chooseFile(true);
            setCurrentProject(loadProjectFromFile(file));
        }
    
    public static saveProject() : void
        {
            if (MenubarController.inputName() != null)
            {
                //save file
            }
        }
    
    public static exportProject() : void
        {
            if (MenubarController.inputName() != null)
            {
                //download file
            }
        }
    
    public static createLibrary() : void
        {
            if (MenubarController.inputName() != null)
            {
                //instantiate library
            }
        }
    
    public static importLibrary() : void
        {
            let file = MenubarController.chooseFile(false);
        }
    
    public static exportLibrary() : void
        {
            if (MenubarController.inputName() != null)
            {
                //download file
            }
        }
    
    private static continueWarningDialog() : boolean  //returns 'true' if 'Continue'-Button is clicked
        {
            let continued : boolean  = false;
            let warningDialogContent = '<p>The current project is not saved. If you continue, it will be deleted.</p>';
            $(warningDialogContent)
                .dialog({
                            title   : 'Warning',
                            modal   : true,
                            buttons : [
                                {
                                    text : 'Continue', click : function()
                                {
                                    continued = true;
                                    $(this)
                                        .dialog('close');
                                }
                                },
                                {
                                    text : 'Cancel', click : function()
                                {
                                    $(this)
                                        .dialog('close');
                                }
                                }]
                        });
            return continued;
        }
    
    private static chooseFile(projectFile : boolean) : File
        {
            let file : File;
            let content = $('<div><input type=\'file\' id=\'files\' name=\'File\'/><output' +
                            ' id=\'list\'></output></div>');
            $(content)
                .dialog({
                            title   : 'Choose your file',
                            modal   : true,
                            buttons : [
                                {
                                    text : 'Import', click : function()
                                {
                                    let x = document.getElementById('files');
                                    file  = x.files[0];
                                    if ((projectFile && file.name.substr(file.name.length - 6, 6) == '.beast') || (!projectFile && file.name.substr(file.name.length - 5, 5) == '.bdcl'))
                                    {
                                        if (file != null)
                                        {
                                            $(this)
                                                .dialog('close');
                                        }
                                    }
                                    else
                                    {
                                        $('<p>Wrong file format! Choose ".beast"- or ".bdcl"- file!</p>')
                                            .dialog({
                                                        buttons : [{
                                                            text : 'Ok', click : function()
                                                            {
                                                                $(this)
                                                                    .dialog('close');
                                                            }
                                                        }]
                                                    });
                                    }
                                }
                                }, {
                                    text : 'Cancel', click : function()
                                    {
                                        $(this)
                                            .dialog('close');
                                    }
                                }]
                        });
            return file;
        }
    
    private static inputName() : string
        {
            let name : string;
            $('<input id = "nameInput" type="text"/>')
                .dialog({
                            title   : 'Input name:',
                            modal   : 'true',
                            buttons : [
                                {
                                    text : 'Ok', click : function()
                                {
                                    name = $('#nameInput').value;
                                    $(this)
                                        .dialog('close');
                                }
                                },
                                {
                                    text : 'Cancel', click : function()
                                {
                                    name = null;
                                    $(this)
                                        .dialog('close');
                                }
                                }
                            ]
                        });
            return name;
        }
}
