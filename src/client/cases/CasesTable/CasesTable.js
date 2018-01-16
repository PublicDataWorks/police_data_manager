import React from 'react'
import Table, {TableBody, TableCell, TableHead, TableRow} from 'material-ui/Table'
import Typography from 'material-ui/Typography'
import {connect} from "react-redux"
import CaseRow from './CaseRow'
import {Paper} from "material-ui";
import themeStyles from '../../globalStyling/styles'

const styles = {
    cell:{
        padding:'0%',
        textAlign: 'center',
        width: '16.5%'
    },
    tableHeadColor: {
        backgroundColor: themeStyles.colors.secondary[50]
    },
    tableHeadRow: {
        width: '100%',
        overflowX: 'scroll'
    },
    tableMargin: {
        marginLeft: '5%',
        marginRight: '5%',
        marginBottom: '3%',
    },
    labelMargin: {
        marginLeft: '5%',
    }
}

class CasesTable extends React.Component {
    render() {
        return (
            <div>
                <Typography
                    type="title"
                    style={styles.labelMargin}>
                    Results
                </Typography>
                <Paper elevation={0} style={styles.tableMargin}>
                    <Table>
                        <TableHead style={styles.tableHeadColor}>
                            <TableRow style={styles.tableHeadRow}>
                                <TableCell data-test='casesNumberHeader' style={styles.cell}>
                                    <Typography type='body2'>Case #</Typography>
                                </TableCell>
                                <TableCell data-test='casesIncidentTypeHeader' style={styles.cell}>
                                    <Typography type='body2'>Incident Type</Typography>
                                </TableCell>
                                <TableCell data-test='casesStatusHeader' style={styles.cell}>
                                    <Typography type='body2'>Status</Typography>
                                </TableCell>
                                <TableCell data-test='casesComplainantHeader' style={styles.cell}>
                                    <Typography type='body2'>Complainant</Typography>
                                </TableCell>
                                <TableCell data-test='casesCreatedOnHeader' style={styles.cell}>
                                    <Typography type='body2'>Created On</Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.props.cases.map(caseDetails => (
                                <CaseRow key={caseDetails.id} caseDetails={caseDetails}/>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </div>)
    }
}
const mapStateToProps = state => ({
    cases: state.cases.all
})

export default connect(mapStateToProps)(CasesTable)
