function combinedCheck(machine)
{
    var completeness = checkCompleteness.createOutputForStateGraph(machine);
    var consistency = checkConsistency.createOutputForCombinedTests(machine);
    var stability = checkStability.createOutputForStateGraph(machine);
    var status = [];

    for (var i=0; i<t_matrix.length; i++)
    {
        if (completeness[i] = 0)
        {
            status[i] += 1;
        }

        if (consistency[i] = 0)
        {
            status[i] += 2;
        }

        if (stability[i] = 0)
        {
            status[i] += 4;
        }
    }

    return status;
}