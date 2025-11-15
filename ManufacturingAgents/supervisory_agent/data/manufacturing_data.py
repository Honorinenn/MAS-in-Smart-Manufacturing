import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Your original data (sample)
original_data = {
    'timestamp': ['########'] * 18,
    'machine_id': ['M003', 'M004', 'M001', 'M003', 'M003', 'M004', 'M001', 'M001', 'M003', 'M002', 'M003', 'M003', 'M003', 'M003', 'M004', 'M001', 'M004', 'M004'],
    'machine_type': ['Welder', 'Conveyor', 'Drill', 'Conveyor', 'CNC', 'Drill', 'Welder', 'CNC', 'CNC', 'Welder', 'Welder', 'Conveyor', 'Drill', 'Welder', 'Welder', 'Drill', 'Welder', 'Welder'],
    'temperature': [78.3028789, 80.87707571, 71.31541791, 76.49619771, 73.61220202, 86.82031656, 91.70081258, 70.50532244, 75.77748576, 76.42137964, 78.27769244, 86.60067371, 75.94855178, 73.85148781, 75.83584768, 74.00092338, 76.89724922, 73.92573589],
    'vibration_level': [2.043750941, 2.175589831, 2.154465079, 2.245977576, 2.037302063, 7.222654797, 7.427526872, 1.592744738, 1.729796585, 1.710739979, 2.324016818, 6.947796745, 2.146191571, 2.32157896, 1.736215165, 2.104578536, 1.962447671, 2.254064631],
    'power_consumption': [23.0598555, 16.01281399, 15.75916416, 16.49026761, 18.06428629, 20.04057209, 27.74665328, 21.38709427, 18.30281478, 17.41462908, 16.7636791, 28.25262084, 16.34839445, 21.69279184, 21.8667195, 18.51359016, 17.97696982, 20.06131962],
    'pressure': [5.086075726, 5.412951759, 5.769405395, 4.618783815, 5.431250158, 4.965513161, 4.948130779, 4.385387724, 4.386084236, 4.601094017, 4.814458228, 4.566725446, 4.820436545, 4.837555857, 5.038701967, 4.354100055, 4.421792741, 5.144765708],
    'material_flow_rate': [20.01102601, 18.37573921, 17.11210668, 21.09068372, 20.86859236, 20.70063642, 21.95439263, 19.00245216, 17.85332879, 19.89495533, 19.47874955, 18.73655642, 19.88022627, 19.08259228, 17.24599207, 19.33823496, 18.29543725, 20.34747211],
    'cycle_time': [118.1465104, 123.0620583, 122.7540642, 118.9902697, 113.7498717, 121.528506, 122.7571827, 123.6291057, 121.7464639, 118.6444243, 124.9700102, 120.3292425, 117.6753849, 119.0967331, 111.2701548, 119.0887909, 123.4421826, 121.6989151],
    'error_rate': [0.883245895, 0.777072942, 0.757374176, 0.796480892, 0.813360983, 1, 1, 0.780686245, 0.718755667, 0.717481476, 0.846162157, 1, 0.769582871, 0.904796305, 0.811233497, 0.825167662, 0.75491789, 0.85555354],
    'downtime': [0, 38, 37, 39, 0, 0, 0, 0, 0, 0, 45, 0, 38, 45, 0, 41, 0, 0],
    'maintenance_flag': [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'efficiency_score': [11.67541046, 3.292705781, 5.762582396, 0.851910751, 18.66390173, 0, 0, 21.91137555, 28.12441333, 28.25185238, 15.38378431, 0, 4.041712862, 0, 18.87665031, 0, 24.50821096, 14.44464604],
    'production_status': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

# Generate timestamps
start_time = datetime(2024, 11, 1, 8, 0)
timestamps = [start_time + timedelta(minutes=15*i) for i in range(len(original_data['machine_id']))]

# Create machine maintenance lookup
maintenance_lookup = {
    'M001': {'last_maintenance': '2024-10-15', 'hours_since': 720, 'predicted_failure': 0.15, 'next_due': '2024-11-20', 'priority': 'medium'},
    'M002': {'last_maintenance': '2024-11-01', 'hours_since': 288, 'predicted_failure': 0.05, 'next_due': '2024-12-01', 'priority': 'low'},
    'M003': {'last_maintenance': '2024-10-20', 'hours_since': 576, 'predicted_failure': 0.25, 'next_due': '2024-11-15', 'priority': 'high'},
    'M004': {'last_maintenance': '2024-11-05', 'hours_since': 192, 'predicted_failure': 0.08, 'next_due': '2024-12-10', 'priority': 'low'}
}

# Create material requirements lookup (which materials each machine type needs)
material_requirements = {
    'Welder': ['MAT001_Steel_Plate', 'MAT003_Welding_Wire'],
    'Drill': ['MAT002_Aluminum_Rod', 'MAT004_Cutting_Fluid'],
    'CNC': ['MAT002_Aluminum_Rod', 'MAT004_Cutting_Fluid'],
    'Conveyor': ['MAT005_Bolts_M10']
}

# Build comprehensive combined dataset
combined_records = []

for i, (ts, machine, machine_type, temp, vib, power, pressure, flow, cycle, 
        error, downtime, maint_flag, eff) in enumerate(zip(
    timestamps,
    original_data['machine_id'],
    original_data['machine_type'],
    original_data['temperature'],
    original_data['vibration_level'],
    original_data['power_consumption'],
    original_data['pressure'],
    original_data['material_flow_rate'],
    original_data['cycle_time'],
    original_data['error_rate'],
    original_data['downtime'],
    original_data['maintenance_flag'],
    original_data['efficiency_score']
)):
    
    # Get maintenance info for this machine
    maint_info = maintenance_lookup[machine]
    
    # Get materials needed
    materials_needed = ', '.join(material_requirements.get(machine_type, ['Unknown']))
    
    # Calculate derived metrics
    output_rate = round(100 - (error * 10), 2)
    quality_score = round(100 - (error * 100), 2)
    defect_rate = round(error * 100, 2)
    
    # Determine statuses
    machine_status = 'maintenance' if maint_flag == 1 else 'operational'
    maintenance_status = 'needs_attention' if maint_info['predicted_failure'] > 0.2 else 'operational'
    quality_status = 'passed' if error < 0.85 else 'failed'
    defect_type = 'none' if error < 0.8 else 'surface_defect' if error < 0.9 else 'dimension'
    
    # Determine shift
    shift = 'morning' if 8 <= ts.hour < 16 else 'afternoon' if 16 <= ts.hour < 24 else 'night'
    
    # Create comprehensive record
    record = {
        # === TEMPORAL INFO ===
        'timestamp': ts,
        'date': ts.date(),
        'time': ts.time(),
        'shift': shift,
        'day_of_week': ts.strftime('%A'),
        
        # === MACHINE INFO ===
        'machine_id': machine,
        'machine_type': machine_type,
        'machine_status': machine_status,
        
        # === PRODUCTION METRICS ===
        'temperature': temp,
        'vibration_level': vib,
        'power_consumption': power,
        'pressure': pressure,
        'material_flow_rate': flow,
        'cycle_time': cycle,
        'output_rate': output_rate,
        'efficiency_score': eff,
        'downtime_minutes': downtime,
        
        # === QUALITY METRICS ===
        'error_rate': error,
        'quality_score': quality_score,
        'defect_rate': defect_rate,
        'defect_type': defect_type,
        'quality_status': quality_status,
        'batch_id': f'B{1234 + i}',
        'product_id': f'PX{str(i).zfill(3)}',
        'inspector': f'QC-{(i % 3) + 1:02d}',
        'rework_required': 1 if error > 0.85 else 0,
        
        # === MAINTENANCE INFO ===
        'last_maintenance_date': maint_info['last_maintenance'],
        'hours_since_maintenance': maint_info['hours_since'],
        'predicted_failure_probability': maint_info['predicted_failure'],
        'next_maintenance_due': maint_info['next_due'],
        'maintenance_priority': maint_info['priority'],
        'maintenance_status': maintenance_status,
        
        # === MATERIAL/INVENTORY INFO ===
        'materials_required': materials_needed,
        
        # === OPERATIONAL STATUS ===
        'anomaly_detected': 1 if (temp > 85 or vib > 5 or error > 0.9) else 0,
        'requires_attention': 1 if (maint_flag == 1 or error > 0.85 or maint_info['predicted_failure'] > 0.2) else 0,
    }
    
    combined_records.append(record)

# Create DataFrame
combined_df = pd.DataFrame(combined_records)

# Add inventory status summary (as additional columns)
# This represents the overall factory inventory state at each timestamp
inventory_status = {
    'inventory_steel_plate_stock': 5000,
    'inventory_aluminum_rod_stock': 3200,
    'inventory_welding_wire_stock': 1500,
    'inventory_cutting_fluid_stock': 800,
    'inventory_bolts_stock': 45000,
    'inventory_paint_stock': 2500,
    'inventory_reorder_alerts': 2,  # Materials below reorder point
    'inventory_status': 'sufficient'
}

# Add inventory columns
for key, value in inventory_status.items():
    combined_df[key] = value

# Add logistics/order context
order_context = {
    'pending_orders': 6,
    'active_shipments': 2,
    'orders_this_week': 3,
    'high_priority_orders': 3
}

for key, value in order_context.items():
    combined_df[key] = value

# Save to CSV
combined_df.to_csv('data/factory_operations_combined.csv', index=False)

print("="*80)
print("✅ COMBINED CSV FILE CREATED SUCCESSFULLY!")
print("="*80)
print(f"\nFile: data/factory_operations_combined.csv")
print(f"Total Records: {len(combined_df)}")
print(f"Total Columns: {len(combined_df.columns)}")
print("\n📊 Column Categories:")
print(f"  • Temporal Info: 5 columns (timestamp, date, time, shift, day_of_week)")
print(f"  • Machine Info: 3 columns (id, type, status)")
print(f"  • Production Metrics: 9 columns (temp, vibration, power, etc.)")
print(f"  • Quality Metrics: 10 columns (error rate, defects, inspection, etc.)")
print(f"  • Maintenance Info: 6 columns (last service, predictions, priority)")
print(f"  • Inventory Status: 8 columns (stock levels, alerts)")
print(f"  • Logistics Context: 4 columns (orders, shipments)")
print(f"  • Operational Flags: 2 columns (anomalies, attention needed)")

print("\n📋 Column Names:")
for i, col in enumerate(combined_df.columns, 1):
    print(f"  {i:2d}. {col}")

print("\n📈 Sample Statistics:")
print(f"  • Machines Monitored: {combined_df['machine_id'].nunique()}")
print(f"  • Machine Types: {', '.join(combined_df['machine_type'].unique())}")
print(f"  • Average Quality Score: {combined_df['quality_score'].mean():.2f}%")
print(f"  • Average Efficiency: {combined_df['efficiency_score'].mean():.2f}")
print(f"  • Total Downtime: {combined_df['downtime_minutes'].sum()} minutes")
print(f"  • Anomalies Detected: {combined_df['anomaly_detected'].sum()}")
print(f"  • Records Requiring Attention: {combined_df['requires_attention'].sum()}")

print("\n🎯 First 3 Rows Preview:")
print(combined_df.head(3).to_string(max_cols=10))

print("\n" + "="*80)
print("✨ Your comprehensive factory operations dataset is ready!")
print("="*80)